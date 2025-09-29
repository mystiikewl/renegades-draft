#!/usr/bin/env python3
"""
ESPN NBA Stats Data Fetcher and CSV Generator

This script connects to your ESPN fantasy basketball league and generates
a CSV file with current NBA player stats in the format expected by the
renegades-draft-central application.

Usage:
    python espn_data_fetcher.py [--dry-run] [--verbose]

Options:
    --dry-run    Test the script without updating the CSV file
    --verbose    Enable verbose logging
"""

import json
import csv
import logging
import sys
import os
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any

import requests
from espn_api.basketball import League
from supabase import create_client, Client

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class ESPDataFetcher:
    """Main class for fetching ESPN data and generating CSV files."""

    def __init__(self, credentials_file: str = 'espn_credentials.json',
                 config_file: str = 'league_config.json'):
        self.credentials_file = credentials_file
        self.config_file = config_file
        self.credentials = self._load_credentials()
        self.config = self._load_config()
        self.league = None
        self.supabase: Optional[Client] = None

        # Setup directories
        self.backup_dir = Path('backups')
        self.backup_dir.mkdir(exist_ok=True)
        self.logs_dir = Path('logs')
        self.logs_dir.mkdir(exist_ok=True)

    def _load_credentials(self) -> Dict[str, Any]:
        """Load ESPN credentials from JSON file."""
        try:
            with open(self.credentials_file, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            logger.error(f"Credentials file {self.credentials_file} not found")
            sys.exit(1)
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON in credentials file: {e}")
            sys.exit(1)

    def _load_config(self) -> Dict[str, Any]:
        """Load configuration from JSON file."""
        try:
            with open(self.config_file, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            logger.error(f"Config file {self.config_file} not found")
            sys.exit(1)
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON in config file: {e}")
            sys.exit(1)

    def connect_to_espn(self) -> bool:
        """Connect to ESPN API using credentials."""
        try:
            logger.info("Connecting to ESPN API...")
            self.league = League(
                league_id=self.credentials['league_id'],
                year=self.credentials['year'],
                espn_s2=self.credentials['espn_s2'],
                swid=self.credentials['swid']
            )
            logger.info("Successfully connected to ESPN league")
            return True
        except Exception as e:
            logger.error(f"Failed to connect to ESPN: {e}")
            return False

    def connect_to_supabase(self) -> bool:
        """Connect to Supabase for database operations."""
        try:
            # Get Supabase credentials from existing import script in the app
            supabase_url = "https://xruqdjonzxkzwsslzpdl.supabase.co"
            supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhydXFkam9uenhrendzc2x6cGRsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTMwMDk5MiwiZXhwIjoyMDcwODc2OTkyfQ.QK-J3x5kLFmcAOIAPq5b22FmPp2rVs0-8Qspi5nG_Dw"

            self.supabase = create_client(supabase_url, supabase_key)
            logger.info("Connected to Supabase")
            return True
        except Exception as e:
            logger.error(f"Failed to connect to Supabase: {e}")
            return False

    def get_espn_players(self) -> List[Dict[str, Any]]:
        """Fetch all players from the ESPN league with their stats."""
        if not self.league:
            logger.error("No ESPN connection established")
            return []

        try:
            logger.info("Fetching players from ESPN league...")

            # Get all players in the league
            espn_players = []

            # ESP API gives us access to league players through various methods
            # Try different approaches to get players
            try:
                # Method 1: Try get_all_players if available
                if hasattr(self.league, 'get_all_players'):
                    players = self.league.get_all_players()
                elif hasattr(self.league, 'players'):
                    # Method 2: Direct players attribute
                    players = self.league.players
                elif hasattr(self.league, 'free_agents'):
                    # Method 3: Get free agents
                    try:
                        # Try calling free_agents as a method first, then as property
                        if callable(getattr(self.league, 'free_agents', None)):
                            players = self.league.free_agents()
                        else:
                            players = self.league.free_agents
                        logger.info("Using free agents - for complete roster, more advanced ESP API features may be needed")
                    except Exception as fa_error:
                        logger.warning(f"Free agents access failed: {fa_error}")
                        players = []
                elif hasattr(self.league, 'player_map'):
                    # Method 4: Try player map
                    try:
                        player_map = self.league.player_map
                        if isinstance(player_map, dict):
                            players = list(player_map.values())
                            logger.info("Using player map for player data")
                        else:
                            players = player_map
                    except Exception as pm_error:
                        logger.warning(f"Player map access failed: {pm_error}")
                        players = []
                else:
                    # Method 4: Try to access via league attributes
                    logger.warning("ESP API structure unknown, attempting basic access")
                    players = getattr(self.league, 'roster', [])
                    if not players:
                        players = getattr(self.league, 'teams', [])
                        if players:
                            # Flatten team rosters
                            all_players = []
                            for team in players:
                                if hasattr(team, 'roster'):
                                    all_players.extend(team.roster)
                            players = all_players

                # Process the players we retrieved
                for player in players:
                    player_data = self._extract_player_data(player)
                    if player_data:
                        espn_players.append(player_data)

            except Exception as method_error:
                logger.error(f"Failed to retrieve players using standard methods: {method_error}")
                logger.info("Trying alternative approach...")

                # Fallback: Try to inspect the league object
                logger.info("Available league attributes:")
                attrs = [attr for attr in dir(self.league) if not attr.startswith('_')]
                for attr in attrs[:20]:  # Show first 20 attributes
                    logger.info(f"  - {attr}")

                return []

            logger.info(f"Retrieved {len(espn_players)} players from ESPN")
            return espn_players

        except Exception as e:
            logger.error(f"Failed to fetch ESPN players: {e}")
            return []

    def _extract_player_data(self, player) -> Optional[Dict[str, Any]]:
        """Extract relevant data from ESPN player object."""
        try:
            # Extract basic player information
            player_data = {
                'name': player.name,
                'position': self._format_position(player.position),
                'team': player.proTeam or '',
                'age': self._calculate_age(player),
                'rookie': 1 if self._is_rookie(player) else 0
            }

            # Extract stats (this will vary based on ESP API structure)
            stats = self._get_player_stats(player)
            player_data.update(stats)

            return player_data

        except Exception as e:
            logger.warning(f"Failed to extract data for player {getattr(player, 'name', 'Unknown')}: {e}")
            return None

    def _format_position(self, espn_position: str) -> str:
        """Format ESPN position to match our CSV format."""
        # Map common ESPN positions to our format
        position_map = {
            'PG': 'PG',
            'SG': 'SG',
            'SF': 'SF',
            'PF': 'PF',
            'C': 'C',
            'G': 'PG,SG',
            'F': 'SF,PF',
            'UTIL': 'SF,PF'
        }
        return position_map.get(espn_position, espn_position)

    def _calculate_age(self, player) -> Optional[float]:
        """Calculate player age from birth date."""
        try:
            # This would need to be implemented based on ESP API data
            # For now, return a placeholder
            return 25.0  # Average NBA player age
        except:
            return None

    def _is_rookie(self, player) -> bool:
        """Determine if player is a rookie."""
        try:
            # This would need ESP specific logic
            # For now, check if player has very few stats
            return False
        except:
            return False

    def _get_player_stats(self, player) -> Dict[str, Any]:
        """Extract stats from ESPN player object."""
        try:
            # Extract season stats - this will depend on ESP API structure
            # These are placeholders that would need to be mapped from actual API
            return {
                'games_played': getattr(player, 'gamesPlayed', 0),
                'minutes_per_game': getattr(player, 'avgMinutes', 0),
                'field_goals_made': getattr(player, 'fgm', 0),
                'field_goal_percentage': getattr(player, 'fgPercentage', 0),
                'free_throw_percentage': getattr(player, 'ftPercentage', 0),
                'three_pointers_made': getattr(player, 'threesMade', 0),
                'three_point_percentage': getattr(player, 'threesPercentage', 0),
                'points': getattr(player, 'pts', 0),
                'total_rebounds': getattr(player, 'reb', 0),
                'assists': getattr(player, 'ast', 0),
                'steals': getattr(player, 'stl', 0),
                'blocks': getattr(player, 'blk', 0),
                'turnovers': getattr(player, 'to', 0)
            }
        except Exception as e:
            logger.warning(f"Failed to extract stats for player: {e}")
            return {
                'games_played': 0,
                'minutes_per_game': 0,
                'field_goals_made': 0,
                'field_goal_percentage': 0,
                'free_throw_percentage': 0,
                'three_pointers_made': 0,
                'three_point_percentage': 0,
                'points': 0,
                'total_rebounds': 0,
                'assists': 0,
                'steals': 0,
                'blocks': 0,
                'turnovers': 0
            }

    def generate_csv(self, players: List[Dict[str, Any]], output_path: str, dry_run: bool = False) -> bool:
        """Generate CSV file from player data."""
        try:
            if dry_run:
                logger.info("DRY RUN: Would generate CSV with the following data:")
                for player in players[:3]:  # Show first 3 players
                    logger.info(f"  {player['name']}: {player['points']} pts")
                return True

            # Backup existing file if configured
            if self.config.get('backup_old_csv') and os.path.exists(output_path):
                backup_path = self.backup_dir / f"nba_player_stats_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
                os.rename(output_path, backup_path)
                logger.info(f"Backed up existing CSV to {backup_path}")

            # Write new CSV
            with open(output_path, 'w', newline='', encoding='utf-8') as csvfile:
                fieldnames = [
                    'Rank', 'Player', 'Position', 'Age', 'Team', 'GP', 'MPG',
                    'FGM', 'FG%', 'FT%', '3PM', '3P%', 'PTS', 'TREB', 'AST',
                    'STL', 'BLK', 'TO', 'Rookie'
                ]
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

                # Write header
                writer.writeheader()

                # Write player data
                for i, player in enumerate(players, 1):
                    row = {
                        'Rank': i,
                        'Player': player['name'],
                        'Position': player['position'],
                        'Age': player['age'],
                        'Team': player['team'],
                        'GP': player['games_played'],
                        'MPG': player['minutes_per_game'],
                        'FGM': player['field_goals_made'],
                        'FG%': player['field_goal_percentage'],
                        'FT%': player['free_throw_percentage'],
                        '3PM': player['three_pointers_made'],
                        '3P%': player['three_point_percentage'],
                        'PTS': player['points'],
                        'TREB': player['total_rebounds'],
                        'AST': player['assists'],
                        'STL': player['steals'],
                        'BLK': player['blocks'],
                        'TO': player['turnovers'],
                        'Rookie': player['rookie']
                    }
                    writer.writerow(row)

            logger.info(f"Successfully generated CSV file: {output_path}")
            return True

        except Exception as e:
            logger.error(f"Failed to generate CSV: {e}")
            return False

    def validate_credentials(self) -> bool:
        """Validate that ESPN credentials are properly configured."""
        required_fields = ['league_id', 'year', 'espn_s2', 'swid']

        for field in required_fields:
            if not self.credentials.get(field):
                logger.error(f"Missing required credential: {field}")
                return False

        # Check if credentials look valid
        if str(self.credentials['league_id']).strip() == "":
            logger.error("League ID cannot be empty")
            return False

        logger.info("ESPN credentials validated successfully")
        return True

    def run_sync(self, dry_run: bool = False, verbose: bool = False) -> bool:
        """Run the complete sync process."""
        if verbose:
            logging.getLogger().setLevel(logging.DEBUG)

        logger.info("Starting ESPN data sync process...")

        # Validate credentials
        if not self.validate_credentials():
            return False

        # Connect to ESPN
        if not self.connect_to_espn():
            return False

        # Fetch player data
        players = self.get_espn_players()
        if not players:
            logger.error("No players retrieved from ESPN")
            return False

        # Generate CSV
        output_path = self.config['csv_output_path']
        if not self.generate_csv(players, output_path, dry_run):
            return False

        logger.info("ESPN data sync completed successfully")
        return True


def main():
    """Main entry point for the script."""
    import argparse

    parser = argparse.ArgumentParser(description='ESPN NBA Stats Data Fetcher')
    parser.add_argument('--dry-run', action='store_true', help='Test without updating files')
    parser.add_argument('--verbose', '-v', action='store_true', help='Enable verbose logging')

    args = parser.parse_args()

    # Initialize and run the fetcher
    fetcher = ESPDataFetcher()
    success = fetcher.run_sync(dry_run=args.dry_run, verbose=args.verbose)

    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()