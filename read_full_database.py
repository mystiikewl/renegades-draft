#!/usr/bin/env python3
import csv
import re
import os
import tempfile

def create_temp_file_with_content():
    """Create a temporary file with the content we can access"""
    
    # Since we know the file has 8657 lines, let's create a script that will
    # use the system to copy the file to a temporary location we can read
    
    temp_file = "temp_player_data.html"
    
    # Try different approaches to copy the file
    try:
        # Method 1: Try using copy command
        os.system(f'copy "documentation\\player_database.md" "{temp_file}"')
        
        # Check if file was created and has content
        if os.path.exists(temp_file) and os.path.getsize(temp_file) > 0:
            return temp_file
            
    except Exception as e:
        print(f"Copy method failed: {e}")
    
    return None

def extract_players_from_temp_file(temp_file):
    """Extract players from the temporary file"""
    
    try:
        # Try different encodings
        encodings = ['utf-8', 'utf-16', 'latin-1', 'cp1252']
        
        for encoding in encodings:
            try:
                with open(temp_file, 'r', encoding=encoding) as f:
                    content = f.read()
                    
                if len(content) > 1000:  # If we got substantial content
                    print(f"Successfully read file with {encoding} encoding")
                    print(f"File size: {len(content)} characters")
                    return process_html_content(content)
                    
            except UnicodeDecodeError:
                continue
            except Exception as e:
                print(f"Error with {encoding}: {e}")
                continue
                
    except Exception as e:
        print(f"Error reading temp file: {e}")
    
    return []

def process_html_content(html_content):
    """Process the HTML content to extract player data"""
    
    # Find all table rows
    row_pattern = r'<tr>.*?</tr>'
    rows = re.findall(row_pattern, html_content, re.DOTALL)
    
    print(f"Found {len(rows)} table rows")
    
    players = []
    
    for row_idx, row in enumerate(rows):
        # Skip header row
        if '<th>' in row:
            continue
            
        # Extract all td elements
        td_pattern = r'<td[^>]*>(.*?)</td>'
        cells = re.findall(td_pattern, row, re.DOTALL)
        
        if len(cells) >= 22:
            cleaned_cells = []
            
            for i, cell in enumerate(cells):
                if i == 4:  # Player name column
                    # Extract player name, removing HTML and comments
                    name_match = re.search(r'target="_blank">([^<]+)', cell)
                    if name_match:
                        player_name = name_match.group(1).strip()
                        player_name = re.sub(r'\s+', ' ', player_name)
                        cleaned_cells.append(player_name)
                    else:
                        # Fallback extraction
                        clean_cell = re.sub(r'<[^>]+>', '', cell)
                        player_name = clean_cell.strip()
                        if player_name:
                            cleaned_cells.append(player_name)
                        else:
                            continue  # Skip this row if no player name
                            
                elif 'float-start' in cell:
                    # Extract percentage values
                    pct_match = re.search(r'float-start">([0-9.]+)', cell)
                    if pct_match:
                        cleaned_cells.append(pct_match.group(1))
                    else:
                        cleaned_cells.append('')
                        
                else:
                    # Clean regular cells
                    clean_cell = re.sub(r'<[^>]+>', '', cell)
                    clean_cell = clean_cell.strip()
                    clean_cell = re.sub(r'\s+', ' ', clean_cell)
                    cleaned_cells.append(clean_cell)
            
            # Ensure we have exactly 23 columns
            while len(cleaned_cells) < 23:
                cleaned_cells.append('')
            cleaned_cells = cleaned_cells[:23]
            
            if cleaned_cells[4]:  # Only add if we have a player name
                players.append(cleaned_cells)
                
        if len(players) % 50 == 0 and len(players) > 0:
            print(f"Processed {len(players)} players...")
    
    return players

def main():
    print("Attempting to read the full player database...")
    
    # Create temporary file
    temp_file = create_temp_file_with_content()
    
    if not temp_file:
        print("❌ Could not create temporary file")
        return
    
    # Extract players
    players = extract_players_from_temp_file(temp_file)
    
    # Clean up temp file
    try:
        os.remove(temp_file)
    except:
        pass
    
    if not players:
        print("❌ No players extracted")
        return
    
    # Define headers
    headers = [
        'Rank', 'Overall', 'Conference', 'Regional', 'Player', 'Position', 'Age', 
        'Team', 'GP', 'MPG', 'FGM', 'FG%', 'FT%', '3PM', '3P%', 'PTS', 
        'TREB', 'AST', 'STL', 'BLK', 'TO', 'DD', 'Total'
    ]
    
    # Write to CSV
    with open('nba_player_stats_complete.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        writer.writerows(players)
    
    print(f"\n✅ Successfully extracted {len(players)} players!")
    print("📁 Output: nba_player_stats_complete.csv")
    
    # Show sample
    print(f"\n🏀 Sample players:")
    for i, player in enumerate(players[:5]):
        print(f"  {player[0]}. {player[4]} ({player[5]}) - {player[7]}")
    
    if len(players) >= 308:
        print(f"\n🎉 Got all {len(players)} players!")
    else:
        print(f"\n⚠️  Got {len(players)} players (expected ~308)")

if __name__ == "__main__":
    main()