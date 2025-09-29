#!/usr/bin/env python3
"""
Setup Environment Script for ESPN Data Sync

This script sets up the Python environment and installs required dependencies
for the ESPN data synchronization system.

Usage:
    python setup_env.py
"""

import subprocess
import sys
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class EnvironmentSetup:
    """Handles environment setup and dependency installation."""

    def __init__(self):
        self.project_root = Path(__file__).parent

    def check_python_version(self) -> bool:
        """Check if Python version is compatible."""
        version = sys.version_info
        if version.major >= 3 and version.minor >= 8:
            logger.info(f"Python version {version.major}.{version.minor}.{version.micro} is compatible")
            return True
        else:
            logger.error(f"Python version {version.major}.{version.minor}.{version.micro} is not compatible")
            logger.error("Minimum required version is Python 3.8")
            return False

    def install_dependencies(self) -> bool:
        """Install Python dependencies from requirements.txt."""
        logger.info("Installing Python dependencies...")

        requirements_file = self.project_root / 'requirements.txt'
        if not requirements_file.exists():
            logger.error("requirements.txt not found")
            return False

        try:
            result = subprocess.run(
                [sys.executable, '-m', 'pip', 'install', '-r', str(requirements_file)],
                capture_output=True,
                text=True,
                timeout=300  # 5 minute timeout
            )

            if result.returncode == 0:
                logger.info("Dependencies installed successfully")
                if result.stdout:
                    logger.info(result.stdout.strip())
                return True
            else:
                logger.error("Failed to install dependencies")
                if result.stderr:
                    logger.error(result.stderr.strip())
                return False

        except subprocess.TimeoutExpired:
            logger.error("Dependency installation timed out")
            return False
        except Exception as e:
            logger.error(f"Failed to install dependencies: {e}")
            return False

    def create_directory_structure(self) -> bool:
        """Create necessary directories for the project."""
        logger.info("Creating directory structure...")

        directories = [
            'logs',
            'backups',
            'temp'
        ]

        try:
            for dir_name in directories:
                dir_path = self.project_root / dir_name
                dir_path.mkdir(exist_ok=True)
                logger.info(f"Created directory: {dir_path}")

            return True
        except Exception as e:
            logger.error(f"Failed to create directories: {e}")
            return False

    def validate_credentials_setup(self) -> bool:
        """Validate that ESPN credentials are set up."""
        logger.info("Validating ESPN credentials setup...")

        creds_file = self.project_root / 'espn_credentials.json'

        if not creds_file.exists():
            logger.warning("ESPN credentials file not found")
            logger.info("Creating template credentials file...")
            return False

        try:
            import json
            with open(creds_file, 'r') as f:
                creds = json.load(f)

            # Check required fields
            required_fields = ['league_id', 'year', 'espn_s2', 'swid']
            missing_fields = []

            for field in required_fields:
                value = str(creds.get(field, '')).strip()
                if not value or value == "":
                    missing_fields.append(field)

            if missing_fields:
                logger.warning(f"Missing or empty credentials: {', '.join(missing_fields)}")
                logger.info("Please fill in your ESPN credentials in espn_credentials.json")
                return False
            else:
                # Mask sensitive fields in log
                masked_creds = creds.copy()
                if 'espn_s2' in masked_creds:
                    masked_creds['espn_s2'] = '*' * len(masked_creds['espn_s2'])
                if 'swid' in masked_creds:
                    masked_creds['swid'] = '*' * len(masked_creds['swid'])

                logger.info("ESPN credentials validated")
                logger.info(f"League ID: {creds.get('league_id')}")
                logger.info(f"Year: {creds.get('year')}")
                return True

        except json.JSONDecodeError:
            logger.error("Invalid JSON in espn_credentials.json")
            return False
        except Exception as e:
            logger.error(f"Failed to validate credentials: {e}")
            return False

    def test_espn_connection(self) -> bool:
        """Test ESP connection with current credentials."""
        logger.info("Testing ESPN API connection...")

        if not self.validate_credentials_setup():
            logger.warning("Cannot test ESPN connection - credentials not set up")
            return False

        try:
            # Test import of espn_api
            from espn_api.basketball import League

            # Try to load credentials
            import json
            with open(self.project_root / 'espn_credentials.json', 'r') as f:
                creds = json.load(f)

            # Attempt connection
            league = League(
                league_id=creds['league_id'],
                year=creds['year'],
                espn_s2=creds['espn_s2'],
                swid=creds['swid']
            )

            # Test basic league info
            league_name = getattr(league, 'league_name', 'Unknown League')
            logger.info(f"Successfully connected to ESPN league: {league_name}")
            return True

        except ImportError:
            logger.error("espn_api library not installed. Run setup again")
            return False
        except Exception as e:
            logger.error(f"ESPN connection test failed: {e}")
            logger.info("Please check your ESPN credentials and network connection")
            return False

    def generate_setup_summary(self, results: dict) -> str:
        """Generate a setup summary report."""
        summary = []
        summary.append("ESPN Data Sync Setup Summary")
        summary.append("=" * 40)

        checks = [
            ("Python Version", results.get('python_version')),
            ("Dependencies", results.get('dependencies')),
            ("Directories", results.get('directories')),
            ("Credentials", results.get('credentials')),
            ("ESPN Connection", results.get('espn_connection'))
        ]

        for check_name, success in checks:
            status = "✅ PASS" if success else "❌ FAIL"
            summary.append(f"{check_name}: {status}")

        summary.append("")
        successful_checks = sum(1 for _, success in checks if success)
        summary.append(f"Passed: {successful_checks}/{len(checks)}")

        if successful_checks == len(checks):
            summary.append("\n🎉 Setup completed successfully!")
            summary.append("\nNext steps:")
            summary.append("1. Run ESP sync: python sync_espn_data.py --dry-run")
            summary.append("2. Schedule automated syncs (see schedule_sync.py)")
        else:
            summary.append("\n⚠️  Setup incomplete. Please resolve failed checks.")

        return "\n".join(summary)

    def run_full_setup(self, skip_tests: bool = False) -> bool:
        """Run the complete environment setup."""
        logger.info("Starting ESPN Data Sync environment setup")

        results = {
            'python_version': False,
            'dependencies': False,
            'directories': False,
            'credentials': False,
            'espn_connection': False
        }

        # Check Python version
        results['python_version'] = self.check_python_version()
        if not results['python_version']:
            return False

        # Install dependencies
        results['dependencies'] = self.install_dependencies()

        # Create directories
        results['directories'] = self.create_directory_structure()

        # Validate credentials
        results['credentials'] = self.validate_credentials_setup()

        # Test ESPN connection (skip if credentials not set up)
        if results['credentials'] and not skip_tests:
            results['espn_connection'] = self.test_espn_connection()
        else:
            results['espn_connection'] = True  # Skip if credentials missing

        # Generate and display summary
        summary = self.generate_setup_summary(results)
        logger.info("\n" + summary)

        return all(results.values())


def main():
    """Main entry point."""
    import argparse

    parser = argparse.ArgumentParser(description='ESPN Data Sync Environment Setup')
    parser.add_argument('--skip-tests', action='store_true',
                       help='Skip ESP connection tests')

    args = parser.parse_args()

    # Initialize and run setup
    setup = EnvironmentSetup()
    success = setup.run_full_setup(skip_tests=args.skip_tests)

    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()