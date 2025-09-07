#!/usr/bin/env python3
"""
Database Cleanup Script for ESPN Player Sync

This script compares the ESPN league player list with the current database
and removes players that are no longer in your ESPN league.

Usage:
    python db_cleanup.py [--dry-run] [--archive] [--delete]
"""

import json
import logging
import sys
from typing import List, Set, Dict, Any

from supabase import create_client, Client

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class DatabaseCleaner:
    """Class for cleaning up database players not in ESPN league."""

    def __init__(self, supabase_url: str, supabase_key: str):
        self.supabase: Client = create_client(supabase_url, supabase_key)

    def get_current_db_players(self) -> List[Dict[str, Any]]:
        """Get all players currently in the database."""
        try:
            response = self.supabase.table('players').select('id, name, nba_team').execute()
            return response.data
        except Exception as e:
            logger.error(f"Failed to fetch database players: {e}")
            return []

    def get_espn_player_names(self) -> Set[str]:
        """Get set of player names from ESPN data."""
        try:
            # Read the generated CSV to get ESPN player names
            import csv
            espn_players = set()

            with open('nba_player_stats.csv', 'r', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                for row in reader:
                    espn_players.add(row['Player'].strip())

            return espn_players
        except FileNotFoundError:
            logger.error("ESPN CSV file not found. Run espn_data_fetcher.py first")
            return set()
        except Exception as e:
            logger.error(f"Failed to read ESPN CSV: {e}")
            return set()

    def identify_players_to_remove(self, db_players: List[Dict[str, Any]],
                                 espn_players: Set[str]) -> List[Dict[str, Any]]:
        """Identify players in database that are not in ESPN league."""
        players_to_remove = []

        for db_player in db_players:
            # Check if player name is in ESPN list
            if db_player['name'] not in espn_players:
                players_to_remove.append(db_player)

        return players_to_remove

    def archive_players(self, players: List[Dict[str, Any]], dry_run: bool = False) -> bool:
        """Archive players by marking them as inactive."""
        if dry_run:
            logger.info("DRY RUN: Would archive the following players:")
            for player in players:
                logger.info(f"  - {player['name']} ({player['nba_team']})")
            return True

        try:
            # Note: This assumes your database has an 'is_active' column
            # If not, you might want to add one or use a different archiving method
            player_ids = [p['id'] for p in players]

            if player_ids:
                self.supabase.table('players').update({
                    'is_active': False
                }).in_('id', player_ids).execute()

                logger.info(f"Successfully archived {len(players)} players")
                return True
            else:
                logger.info("No players to archive")
                return True

        except Exception as e:
            logger.error(f"Failed to archive players: {e}")
            return False

    def delete_players(self, players: List[Dict[str, Any]], dry_run: bool = False) -> bool:
        """Permanently delete players from database."""
        if dry_run:
            logger.info("DRY RUN: Would delete the following players:")
            for player in players:
                logger.info(f"  - {player['name']} ({player['nba_team']})")
            return True

        try:
            player_ids = [p['id'] for p in players]

            if player_ids:
                self.supabase.table('players').delete().in_('id', player_ids).execute()
                logger.info(f"Successfully deleted {len(players)} players")
                return True
            else:
                logger.info("No players to delete")
                return True

        except Exception as e:
            logger.error(f"Failed to delete players: {e}")
            return False

    def generate_cleanup_report(self, players_to_remove: List[Dict[str, Any]]) -> str:
        """Generate a report of players being cleaned up."""
        report = []
        report.append("Database Cleanup Report")
        report.append("=" * 50)
        report.append(f"Total players to remove: {len(players_to_remove)}")
        report.append("")

        if players_to_remove:
            report.append("Players to be removed:")
            for player in players_to_remove:
                report.append(f"  - {player['name']} ({player['nba_team']})")
        else:
            report.append("No players to remove - database is in sync with ESPN")

        return "\n".join(report)

    def cleanup_database(self, mode: str = 'archive', dry_run: bool = False) -> bool:
        """Main cleanup method."""
        logger.info(f"Starting database cleanup in {mode} mode{' (DRY RUN)' if dry_run else ''}")

        # Get current database players
        db_players = self.get_current_db_players()
        if not db_players:
            logger.error("Failed to get database players")
            return False

        logger.info(f"Found {len(db_players)} players in database")

        # Get ESPN player names
        espn_players = self.get_espn_player_names()
        if not espn_players:
            logger.error("Failed to get ESPN players")
            return False

        logger.info(f"Found {len(espn_players)} players in ESPN league")

        # Identify players to remove
        players_to_remove = self.identify_players_to_remove(db_players, espn_players)

        # Generate and display report
        report = self.generate_cleanup_report(players_to_remove)
        logger.info("\n" + report)

        if not players_to_remove:
            logger.info("Database is already in sync with ESPN league")
            return True

        # Perform cleanup based on mode
        if mode == 'archive':
            success = self.archive_players(players_to_remove, dry_run)
        elif mode == 'delete':
            success = self.delete_players(players_to_remove, dry_run)
        else:
            logger.error(f"Invalid cleanup mode: {mode}")
            return False

        if success:
            if dry_run:
                logger.info("DRY RUN completed successfully")
            else:
                logger.info("Database cleanup completed successfully")

        return success


def main():
    """Main entry point."""
    import argparse

    parser = argparse.ArgumentParser(description='Database Cleanup for ESPN Sync')
    parser.add_argument('--dry-run', action='store_true', help='Test without making changes')
    parser.add_argument('--archive', action='store_true', help='Archive players instead of deleting')
    parser.add_argument('--delete', action='store_true', help='Permanently delete players')
    parser.add_argument('--mode', choices=['archive', 'delete'], default='archive',
                       help='Cleanup mode (default: archive)')

    args = parser.parse_args()

    # Override mode if specific flags are used
    if args.archive:
        mode = 'archive'
    elif args.delete:
        mode = 'delete'
    else:
        mode = args.mode

    # Supabase credentials
    supabase_url = "https://xruqdjonzxkzwsslzpdl.supabase.co"
    supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhydXFkam9uenhrendzc2x6cGRsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTMwMDk5MiwiZXhwItoyMDcwODc2OTkyfQ.QK-J3x5kLFmcAOIAPq5b22FmPp2rVs0-8Qspi5nG_Dw"

    # Initialize and run cleanup
    cleaner = DatabaseCleaner(supabase_url, supabase_key)
    success = cleaner.cleanup_database(mode=mode, dry_run=args.dry_run)

    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()