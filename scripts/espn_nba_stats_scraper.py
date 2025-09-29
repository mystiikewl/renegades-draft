#!/usr/bin/env python3
"""
ESPn NBA Player Stats Scraper

Scrapes current season NBA player statistics from ESPn individual player pages
and generates a CSV file with the requested stats.

Usage:
    python espn_nba_stats_scraper.py [--dry-run] [--verbose] [--limit N]

Options:
    --dry-run    Test the script without updating the CSV file
    --verbose    Enable verbose logging
    --limit N    Limit to N players for testing (default: all players)
"""

import json
import csv
import logging
import sys
import time
import requests
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class ESPnNBAScraper:
    """Scraper for ESPn NBA player statistics."""

    def __init__(self, output_path: str = 'nba_player_stats.csv'):
        self.output_path = output_path
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })

        # Setup directories
        self.backup_dir = Path('backups')
        self.backup_dir.mkdir(exist_ok=True)
        self.logs_dir = Path('logs')
        self.logs_dir.mkdir(exist_ok=True)

        # Stats mapping from ESPn headers to our desired format
        self.stats_mapping = {
            'FGM': 'FGM',
            'FG%': 'FG%',
            'FT%': 'FT%',
            '3PM': '3PM',
            '3P%': '3P%',
            'REB': 'REB',
            'AST': 'AST',
            'STL': 'STL',
            'BLK': 'BLK',
            'TO': 'TO',
            'PTS': 'PTS'
        }

    def get_nba_players(self, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get list of NBA players from ESPn API."""
        logger.info("Fetching NBA players list...")

        try:
            # ESPn NBA athletes API
            url = "https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/athletes"
            params = {'limit': limit or 1000}

            response = self.session.get(url, params=params, timeout=30)
            response.raise_for_status()

            data = response.json()
            players = []

            for item in data.get('items', []):
                if isinstance(item, dict) and '$ref' in item:
                    # Extract player ID from the reference URL
                    ref_url = item['$ref']
                    player_id = ref_url.split('/')[-1]

                    # Get basic player info
                    player_info = self._get_player_basic_info(player_id)
                    if player_info:
                        players.append(player_info)

            logger.info(f"Retrieved {len(players)} NBA players")
            return players

        except Exception as e:
            logger.error(f"Failed to fetch NBA players: {e}")
            return []

    def _get_player_basic_info(self, player_id: str) -> Optional[Dict[str, Any]]:
        """Get basic player information."""
        try:
            url = f"https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/athletes/{player_id}"
            response = self.session.get(url, timeout=10)
            response.raise_for_status()

            data = response.json()
            return {
                'id': player_id,
                'name': data.get('fullName', ''),
                'team': data.get('team', {}).get('abbreviation', ''),
                'position': data.get('position', {}).get('abbreviation', '')
            }
        except Exception as e:
            logger.warning(f"Failed to get info for player {player_id}: {e}")
            return None

    def scrape_player_stats(self, player_id: str, player_name: str) -> Optional[Dict[str, Any]]:
        """Scrape stats from individual player page."""
        try:
            # Clean player name for URL
            clean_name = player_name.lower().replace(' ', '-').replace("'", '').replace('.', '')

            url = f"https://www.espn.com/nba/player/stats/_/id/{player_id}/{clean_name}"
            logger.debug(f"Scraping: {url}")

            response = self.session.get(url, timeout=15)
            response.raise_for_status()

            soup = BeautifulSoup(response.text, 'html.parser')

            # Find all stats tables (ESPn has multiple tables for different stat categories)
            tables = soup.find_all('table')

            if not tables:
                logger.warning(f"No stats tables found for {player_name}")
                return None

            # Initialize stats dictionary
            stats_dict = {
                'Player': player_name,
                'Team': '',
                'Position': '',
                'FGM': '0',
                'FG%': '0',
                'FT%': '0',
                '3PM': '0',
                '3P%': '0',
                'REB': '0',
                'AST': '0',
                'STL': '0',
                'BLK': '0',
                'TO': '0',
                'PTS': '0',
                'DD': '0',
                'TD': '0'
            }

            # Look through all tables for the main season stats
            for table in tables:
                # Get headers
                header_row = table.find('thead')
                if not header_row:
                    continue

                headers = [th.get_text(strip=True) for th in header_row.find_all('th') if th.get_text(strip=True)]

                # Get data rows
                body = table.find('tbody')
                if not body:
                    continue

                rows = body.find_all('tr')
                if not rows:
                    continue

                # Look for the season totals row (usually the first row)
                for row in rows[:2]:  # Check first 2 rows
                    cells = row.find_all(['td', 'th'])
                    data_row = [cell.get_text(strip=True) for cell in cells if cell.get_text(strip=True)]

                    # Skip if not enough data
                    if len(data_row) < len(headers):
                        continue

                    # Extract stats based on headers
                    for i, header in enumerate(headers):
                        if i < len(data_row):
                            # Map common ESPn headers to our format
                            if header == 'FGM':
                                stats_dict['FGM'] = data_row[i]
                            elif header == 'FG%':
                                stats_dict['FG%'] = data_row[i]
                            elif header == 'FT%':
                                stats_dict['FT%'] = data_row[i]
                            elif header == '3PM':
                                stats_dict['3PM'] = data_row[i]
                            elif header == '3P%':
                                stats_dict['3P%'] = data_row[i]
                            elif header in ['REB', 'TREB']:
                                stats_dict['REB'] = data_row[i]
                            elif header == 'AST':
                                stats_dict['AST'] = data_row[i]
                            elif header == 'STL':
                                stats_dict['STL'] = data_row[i]
                            elif header == 'BLK':
                                stats_dict['BLK'] = data_row[i]
                            elif header in ['TO', 'TOV']:
                                stats_dict['TO'] = data_row[i]
                            elif header == 'PTS':
                                stats_dict['PTS'] = data_row[i]

            logger.debug(f"Extracted stats for {player_name}: {stats_dict}")
            return stats_dict

        except Exception as e:
            logger.warning(f"Failed to scrape stats for {player_name}: {e}")
            return None

    def generate_csv(self, players_data: List[Dict[str, Any]], dry_run: bool = False) -> bool:
        """Generate CSV file from player data."""
        try:
            if dry_run:
                logger.info("DRY RUN: Would generate CSV with the following data:")
                for i, player in enumerate(players_data[:3]):
                    logger.info(f"  {i+1}. {player.get('Player', 'Unknown')}: {player.get('PTS', 'N/A')} pts")
                return True

            # Backup existing file
            if Path(self.output_path).exists():
                backup_path = self.backup_dir / f"nba_player_stats_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
                Path(self.output_path).rename(backup_path)
                logger.info(f"Backed up existing CSV to {backup_path}")

            # Define CSV headers
            fieldnames = [
                'Rank', 'Player', 'Position', 'Age', 'Team', 'GP', 'MPG',
                'FGM', 'FG%', 'FT%', '3PM', '3P%', 'PTS', 'REB', 'AST',
                'STL', 'BLK', 'TO', 'DD', 'TD'
            ]

            # Write CSV
            with open(self.output_path, 'w', newline='', encoding='utf-8') as csvfile:
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                writer.writeheader()

                for i, player in enumerate(players_data, 1):
                    row = {
                        'Rank': i,
                        'Player': player.get('Player', ''),
                        'Position': player.get('Position', ''),
                        'Age': '25.0',  # Placeholder
                        'Team': player.get('Team', ''),
                        'GP': '0',  # Would need to scrape this too
                        'MPG': '0',  # Would need to scrape this too
                        'FGM': player.get('FGM', '0'),
                        'FG%': player.get('FG%', '0'),
                        'FT%': player.get('FT%', '0'),
                        '3PM': player.get('3PM', '0'),
                        '3P%': player.get('3P%', '0'),
                        'PTS': player.get('PTS', '0'),
                        'REB': player.get('REB', '0'),
                        'AST': player.get('AST', '0'),
                        'STL': player.get('STL', '0'),
                        'BLK': player.get('BLK', '0'),
                        'TO': player.get('TO', '0'),
                        'DD': player.get('DD', '0'),
                        'TD': player.get('TD', '0')
                    }
                    writer.writerow(row)

            logger.info(f"Successfully generated CSV file: {self.output_path}")
            return True

        except Exception as e:
            logger.error(f"Failed to generate CSV: {e}")
            return False

    def run_scraper(self, dry_run: bool = False, verbose: bool = False, limit: Optional[int] = None) -> bool:
        """Run the complete scraping process."""
        if verbose:
            logging.getLogger().setLevel(logging.DEBUG)

        logger.info("Starting ESPn NBA stats scraping process...")

        # Get player list
        players = self.get_nba_players(limit=limit)
        if not players:
            logger.error("No players retrieved")
            return False

        # Scrape stats for each player
        players_data = []
        total_players = len(players)

        logger.info(f"Starting to scrape stats for {total_players} players...")

        for i, player in enumerate(players):
            if verbose or (i + 1) % 50 == 0:
                logger.info(f"Processing player {i+1}/{total_players}: {player['name']}")

            stats = self.scrape_player_stats(player['id'], player['name'])
            if stats:
                # Merge player info with stats
                stats.update({
                    'Team': player.get('team', ''),
                    'Position': player.get('position', '')
                })
                players_data.append(stats)

            # Rate limiting
            time.sleep(0.5)

        logger.info(f"Successfully scraped stats for {len(players_data)} players")

        # Generate CSV
        if not self.generate_csv(players_data, dry_run):
            return False

        logger.info("ESPn NBA stats scraping completed successfully")
        return True


def main():
    """Main entry point."""
    import argparse

    parser = argparse.ArgumentParser(description='ESPn NBA Player Stats Scraper')
    parser.add_argument('--dry-run', action='store_true', help='Test without updating files')
    parser.add_argument('--verbose', '-v', action='store_true', help='Enable verbose logging')
    parser.add_argument('--limit', type=int, help='Limit number of players to scrape')

    args = parser.parse_args()

    # Initialize and run scraper
    scraper = ESPnNBAScraper()
    success = scraper.run_scraper(
        dry_run=args.dry_run,
        verbose=args.verbose,
        limit=args.limit
    )

    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
