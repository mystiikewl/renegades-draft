#!/usr/bin/env python3
"""
Master ESPN Data Sync Script

This script orchestrates the complete ESPN data synchronization process:
1. Fetches data from ESPN API and generates CSV
2. Cleans up database (removes players not in ESPN league)
3. Runs the existing import process to update database

Usage:
    python sync_espn_data.py [--dry-run] [--skip-fetch] [--skip-cleanup] [--skip-import]
"""

import subprocess
import sys
import logging
import os
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class ESPNSyncOrchestrator:
    """Orchestrates the complete ESPN data sync process."""

    def __init__(self):
        self.project_root = Path(__file__).parent
        self.app_dir = self.project_root / 'renegades-draft-central'

    def run_espn_fetcher(self, dry_run: bool = False) -> bool:
        """Run the ESPN data fetcher script."""
        logger.info("Step 1: Running ESPN data fetcher...")

        cmd = [sys.executable, 'espn_data_fetcher.py']
        if dry_run:
            cmd.append('--dry-run')

        try:
            result = subprocess.run(
                cmd,
                cwd=self.project_root,
                capture_output=True,
                text=True,
                timeout=300  # 5 minute timeout
            )

            if result.returncode == 0:
                logger.info("ESPN data fetcher completed successfully")
                if result.stdout:
                    logger.info(result.stdout.strip())
                return True
            else:
                logger.error("ESPN data fetcher failed")
                if result.stderr:
                    logger.error(result.stderr.strip())
                return False

        except subprocess.TimeoutExpired:
            logger.error("ESPN data fetcher timed out")
            return False
        except Exception as e:
            logger.error(f"Failed to run ESPN fetcher: {e}")
            return False

    def run_database_cleanup(self, dry_run: bool = False) -> bool:
        """Run the database cleanup script."""
        logger.info("Step 2: Running database cleanup...")

        cmd = [sys.executable, 'db_cleanup.py']
        if dry_run:
            cmd.append('--dry-run')

        try:
            result = subprocess.run(
                cmd,
                cwd=self.project_root,
                capture_output=True,
                text=True,
                timeout=180  # 3 minute timeout
            )

            if result.returncode == 0:
                logger.info("Database cleanup completed successfully")
                if result.stdout:
                    logger.info(result.stdout.strip())
                return True
            else:
                logger.error("Database cleanup failed")
                if result.stderr:
                    logger.error(result.stderr.strip())
                return False

        except subprocess.TimeoutExpired:
            logger.error("Database cleanup timed out")
            return False
        except Exception as e:
            logger.error(f"Failed to run cleanup: {e}")
            return False

    def run_import_process(self) -> bool:
        """Run the existing CSV import process."""
        logger.info("Step 3: Running player data import...")

        # Change to app directory and run the import script
        import_script = self.app_dir / 'scripts' / 'import-players.js'

        if not import_script.exists():
            logger.error(f"Import script not found: {import_script}")
            return False

        try:
            # Use Node.js to run the import script
            result = subprocess.run(
                ['node', str(import_script.relative_to(self.project_root))],
                cwd=self.app_dir,
                capture_output=True,
                text=True,
                timeout=600  # 10 minute timeout
            )

            if result.returncode == 0:
                logger.info("Player data import completed successfully")
                if result.stdout:
                    logger.info(result.stdout.strip())
                return True
            else:
                logger.error("Player data import failed")
                if result.stderr:
                    logger.error(result.stderr.strip())
                return False

        except subprocess.TimeoutExpired:
            logger.error("Player data import timed out")
            return False
        except Exception as e:
            logger.error(f"Failed to run import: {e}")
            return False

    def validate_setup(self) -> bool:
        """Validate that all required files and dependencies exist."""
        logger.info("Validating setup...")

        # Check if credentials file exists and has data
        creds_file = self.project_root / 'espn_credentials.json'
        if not creds_file.exists():
            logger.error("ESPN credentials file not found")
            return False

        try:
            import json
            with open(creds_file, 'r') as f:
                creds = json.load(f)
                if not all(creds.get(field) for field in ['league_id', 'espn_s2', 'swid']):
                    logger.error("ESPN credentials are incomplete")
                    return False
        except Exception as e:
            logger.error(f"Failed to validate credentials: {e}")
            return False

        # Check if CSV file exists (should exist after ESPN fetch)
        csv_file = self.project_root / 'nba_player_stats.csv'
        if not csv_file.exists():
            logger.warning("NBA stats CSV file not found - ESPN fetcher will create it")

        # Check if import script exists
        import_script = self.app_dir / 'scripts' / 'import-players.js'
        if not import_script.exists():
            logger.error("Player import script not found")
            return False

        logger.info("Setup validation completed successfully")
        return True

    def generate_sync_report(self, results: dict) -> str:
        """Generate a summary report of the sync process."""
        report = []
        report.append("ESPN Data Sync Report")
        report.append("=" * 50)

        steps = [
            ("ESPN Data Fetch", results.get('fetch')),
            ("Database Cleanup", results.get('cleanup')),
            ("Data Import", results.get('import'))
        ]

        for step_name, success in steps:
            status = "✅ SUCCESS" if success else "❌ FAILED"
            report.append(f"{step_name}: {status}")

        report.append("")
        report.append("Sync Summary:")
        successful_steps = sum(1 for _, success in steps if success)
        report.append(f"  Completed: {successful_steps}/{len(steps)} steps")

        if successful_steps == len(steps):
            report.append("  Status: 🎉 Full sync completed successfully!")
        elif successful_steps > 0:
            report.append("  Status: ⚠️  Partial sync - some steps failed")
        else:
            report.append("  Status: 💥 Sync failed completely")

        return "\n".join(report)

    def run_full_sync(self, dry_run: bool = False, skip_fetch: bool = False,
                     skip_cleanup: bool = False, skip_import: bool = False) -> bool:
        """Run the complete sync process."""
        logger.info("Starting full ESPN data synchronization")

        if dry_run:
            logger.info("DRY RUN MODE: No actual changes will be made")

        # Validate setup
        if not self.validate_setup():
            logger.error("Setup validation failed")
            return False

        results = {
            'fetch': False,
            'cleanup': False,
            'import': False
        }

        # Step 1: Fetch ESPN data
        if not skip_fetch:
            results['fetch'] = self.run_espn_fetcher(dry_run)
            if not results['fetch']:
                logger.error("ESPN data fetch failed - aborting sync")
                return False
        else:
            logger.info("Skipping ESPN data fetch (--skip-fetch)")
            results['fetch'] = True

        # Step 2: Clean up database
        if not skip_cleanup:
            results['cleanup'] = self.run_database_cleanup(dry_run)
            if not results['cleanup']:
                logger.warning("Database cleanup failed - continuing with import")
                # Don't abort here, import can still proceed
        else:
            logger.info("Skipping database cleanup (--skip-cleanup)")
            results['cleanup'] = True

        # Step 3: Run import process
        if not skip_import:
            results['import'] = self.run_import_process()
            if not results['import']:
                logger.error("Import process failed")
                return False
        else:
            logger.info("Skipping data import (--skip-import)")
            results['import'] = True

        # Generate and display report
        report = self.generate_sync_report(results)
        logger.info("\n" + report)

        # Return overall success
        return all(results.values())


def main():
    """Main entry point."""
    import argparse

    parser = argparse.ArgumentParser(description='Master ESPN Data Sync Orchestrator')
    parser.add_argument('--dry-run', action='store_true',
                       help='Test without making actual changes')
    parser.add_argument('--skip-fetch', action='store_true',
                       help='Skip ESPN data fetching step')
    parser.add_argument('--skip-cleanup', action='store_true',
                       help='Skip database cleanup step')
    parser.add_argument('--skip-import', action='store_true',
                       help='Skip CSV import step')

    args = parser.parse_args()

    # Check for mutually exclusive skip options
    if args.skip_fetch and args.skip_cleanup and args.skip_import:
        logger.error("Cannot skip all steps")
        sys.exit(1)

    # Initialize and run sync
    orchestrator = ESPNSyncOrchestrator()
    success = orchestrator.run_full_sync(
        dry_run=args.dry_run,
        skip_fetch=args.skip_fetch,
        skip_cleanup=args.skip_cleanup,
        skip_import=args.skip_import
    )

    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()