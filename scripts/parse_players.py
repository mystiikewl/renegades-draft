#!/usr/bin/env python3
import re
import csv
from html import unescape


def extract_player_data(html_content):
    """Extract player data from HTML table and convert to CSV format"""
    
    # Find all table rows with player data
    row_pattern = r'<tr>.*?</tr>'
    rows = re.findall(row_pattern, html_content, re.DOTALL)
    
    players = []
    
    for row in rows:
        # Skip header row
        if '<th>' in row:
            continue
            
        # Extract all td elements
        td_pattern = r'<td[^>]*>(.*?)</td>'
        cells = re.findall(td_pattern, row, re.DOTALL)
        
        # We need at least 7 cells to work with (rank, player, mobile, age, team, pos, comments)
        if len(cells) < 7:
            continue
            
        # Extract rank from first cell
        rank_cell = cells[0]
        # Handle both arrow icons and plain text for rank changes
        rank_match = re.search(r'#(\d+)', rank_cell)
        rank = rank_match.group(1) if rank_match else ""
        
        # Skip if no rank
        if not rank:
            continue
            
        # Extract player name from the second cell (desktop view)
        name_cell = cells[1] if len(cells) > 1 else ""
        # Extract player name - text before the input field
        name_match = re.search(r'([^<\n]+)\s*<input', name_cell)
        if not name_match:
            # Fallback: just get the first text content
            name_match = re.search(r'([^<\n]+)', name_cell)
        player_name = name_match.group(1).strip() if name_match else ""
        
        # Clean up player name (remove extra whitespace and common artifacts)
        player_name = re.sub(r'\s+', ' ', player_name).strip()
        player_name = player_name.replace("                                                     ", " ").strip()
        
        # Skip if no player name
        if not player_name:
            continue
            
        # Extract age, team, and position from dedicated cells (indices 3, 4, 5)
        age = cells[3].strip() if len(cells) > 3 else ""
        team = cells[4].strip() if len(cells) > 4 else ""
        position = cells[5].strip() if len(cells) > 5 else ""
        
        # If we didn't get them from dedicated cells, try the mobile cell
        if not age or not team or not position:
            # Extract player details from the mobile view cell (cell index 2)
            mobile_cell = cells[2] if len(cells) > 2 else ""
            
            # Extract team, position, and age with a more flexible pattern
            team_pos_age_match = re.search(r'<br> <span style="font-size: 0\.8em;">\(([^,]+),\s*([^)]*)\)</span>\s*<br>\s*<span style="font-size: 0\.8em;">AGE:\s*([0-9.]+)</span>', mobile_cell)
            if team_pos_age_match:
                if not team:
                    team = team_pos_age_match.group(1).strip()
                if not position:
                    position = team_pos_age_match.group(2).strip()
                if not age:
                    age = team_pos_age_match.group(3).strip()
        
        # Extract stats from the mobile view cell (cell index 2)
        mobile_cell = cells[2] if len(cells) > 2 else ""
        
        # Extract stats from the kbd elements in the mobile view cell
        # More flexible pattern to match the kbd elements with different classes and whitespace
        stats_pattern = r'<kbd[^>]*style="font-size:\s*0\.8em;"[^>]*class="[^"]*"[^>]*>([0-9.]+)\s*([A-Z%0-9]+)</kbd>'
        stats_matches = re.findall(stats_pattern, mobile_cell)
        
        # Fallback pattern if the above doesn't work
        if not stats_matches:
            stats_pattern = r'<kbd[^>]*class="[^"]*"[^>]*style="font-size:\s*0\.8em;"[^>]*>([0-9.]+)\s*([A-Z%0-9]+)</kbd>'
            stats_matches = re.findall(stats_pattern, mobile_cell)
        
        # Another fallback pattern
        if not stats_matches:
            stats_pattern = r'<kbd[^>]*>([0-9.]+)\s*([A-Z%0-9]+)</kbd>'
            stats_matches = re.findall(stats_pattern, mobile_cell)
        
        # Determine if player is a rookie (no stats available)
        is_rookie = not any(stat[0] for stat in stats_matches)  # True if no stats found
        
        # Initialize stats dictionary
        stats = {
            'GP': '', 'FG%': '', 'FT%': '', '3PM': '', 'PTS': '',
            'REB': '', 'AST': '', 'STL': '', 'BLK': '', 'TO': ''
        }
        
        # Fill stats dictionary
        for value, stat in stats_matches:
            if stat in stats:
                # Preserve the original format (with or without decimal)
                stats[stat] = value
        
        # Create the player row with the required format
        player_row = [
            rank,  # Rank
            player_name,  # Player
            position,  # Position
            age,  # Age
            team,  # Team
            stats['GP'],  # GP
            '',  # MPG (not available)
            '',  # FGM (not available)
            stats['FG%'],  # FG%
            stats['FT%'],  # FT%
            stats['3PM'],  # 3PM
            '',  # 3P% (not available)
            stats['PTS'],  # PTS
            stats['REB'],  # TREB
            stats['AST'],  # AST
            stats['STL'],  # STL
            stats['BLK'],  # BLK
            stats['TO'],  # TO
            '1' if is_rookie else '0'  # Rookie
        ]
        
        players.append(player_row)
    
    return players


def main():
    # Read the markdown file
    with open('documentation/player_database.md', 'r', encoding='utf-8') as f:
        content = f.read()
    
    print(f"File size: {len(content)} characters")
    
    # Find all table rows
    row_pattern = r'<tr>.*?</tr>'
    rows = re.findall(row_pattern, content, re.DOTALL)
    print(f"Found {len(rows)} table rows")
    
    # Extract player data
    players = extract_player_data(content)
    
    # Define CSV headers
    headers = [
        'Rank', 'Player', 'Position', 'Age', 
        'Team', 'GP', 'MPG', 'FGM', 'FG%', 'FT%', '3PM', '3P%', 'PTS', 
        'TREB', 'AST', 'STL', 'BLK', 'TO', 'Rookie'
    ]
    
    # Write to CSV
    with open('nba_player_stats.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        writer.writerows(players)
    
    print(f"Successfully converted {len(players)} players to CSV format")
    print("Output file: nba_player_stats.csv")

if __name__ == "__main__":
    main()