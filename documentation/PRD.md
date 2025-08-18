Product Requirements Document: NBA Dynasty Slow Draft Tool

Version: 1.2

Date: 16 August 2025
1. Introduction & Vision

This document outlines the requirements for a web-based application designed to replace a traditional spreadsheet for conducting a slow draft for a 10-team ESPN NBA dynasty fantasy league. The vision is to create a centralised, user-friendly, and engaging platform where league members can manage their draft picks efficiently, track available players, and monitor the draft's progress in real-time.

This application will focus on the live draft experience, assuming that an admin user has pre-configured the league, teams, keepers, and draft order.
2. User Goals & Personas
Personas

    Admin: The league organiser. Responsible for pre-draft setup (teams, keepers), managing the player database, managing the live draft, approving trades, and resolving any issues.

    Team Manager: A league participant. Responsible for making draft picks, proposing/reviewing trades, and monitoring the draft.

User Goals

    As an Admin, I want to:

        Upload and manage the master list of players in the database.

        Manage the draft board and ensure picks are allocated correctly.

        Review and approve/reject trades between team managers.

        Be able to manually assign a player if a manager is unavailable.

        Pause and resume the draft if needed.

        Easily export the final draft results.

    As a Team Manager, I want to:

        Clearly see the current state of the draft board, including traded picks.

        Know when it is my turn to pick.

        Easily search and filter the list of available players using our league's custom stats.

        Create a personal queue of players I'm interested in.

        Propose, accept, or decline trades involving players and draft picks with other managers.

        View my current roster and the rosters of other teams as they are built.

3. Key Features
3.1. Draft Administration (Admin)

    Player Pool Management: An interface for the admin to add, edit, or remove players from the master player database in Supabase. This includes the initial setup by importing the nba_player_stats_complete.csv data.

    Admin Dashboard: A central view showing the current pick and league activity.

    Trade Approval: An interface to review pending trades and approve or reject them. Approved trades must automatically update the draft board and team rosters.

    Manual Pick Entry: Allow the admin to make a selection on behalf of any team.

    Draft Control: Buttons to pause, resume, or end the draft.

    Phase Management: Ability to initiate and conclude the "Expansion Draft" phase before starting the main draft.

3.2. Expansion Draft Phase

    A special pre-draft event for the two new expansion teams.

    The available player pool for this phase is restricted to non-rookie players who were not assigned as keepers to the original 8 teams.

    The two new teams will conduct a snake draft until each has selected 9 keepers.

    This phase must be completed before the main draft can commence.

3.3. The Draft Room (All Users)

    Real-Time Draft Board: A grid view showing all draft picks by team and round. The board must clearly indicate original vs. traded pick ownership and update instantly.

    Available Player Pool: A searchable, sortable, and filterable list of all NBA players, sourced from the league's custom database (nba_player_stats_complete.csv) hosted in Supabase. This list excludes players already selected as keepers or drafted.

    Team Rosters View: A display showing each fantasy team's current roster.

    Draft Activity Log: A running log of all picks and completed trades.

3.4. Team Manager Features

    Player Queue: Allow managers to create a prioritised list of players they want to draft.

    "On the Clock" Notifications: Clear visual alerts within the app when it is the manager's turn to pick.

    Simple Pick Selection: An intuitive "Draft Player" button next to each player.

    Trade Interface: A feature to propose a trade to another team, offering a combination of players and/or draft picks.

4. User Flows
4.1. Expansion Draft Flow

    Admin logs in and initiates the "Expansion Draft" phase.

    The two new Team Managers are notified. The draft order is set for this phase.

    The first manager selects a player from the available non-rookie pool.

    The pick is confirmed and rosters are updated.

    The process repeats in a snake format until both teams have 9 players.

    Admin concludes the Expansion Draft and initiates the Main Draft.

4.2. Main Drafting Flow

    Team Manager logs in and sees the main Draft Room.

    When it is their turn, a notification appears.

    The manager selects a player from their queue or the main player pool and confirms their pick.

    The Draft Board and all team rosters update in real-time. The next manager is now on the clock.

4.3. Trade Flow

    Manager A navigates to the "Trade" section and proposes a trade to Manager B (e.g., "My 1st round pick (1.05) for your 3rd round pick (3.02) and Player X").

    Manager B receives a notification of the trade offer and can review, accept, or decline it.

    If Manager B accepts, the trade is sent to the Admin for final approval.

    The Admin reviews the trade and clicks "Approve".

    The system automatically updates the Draft Board to show Manager A now owns pick 3.02 and Manager B owns pick 1.05. Player X is moved to Manager A's roster.

5. Non-Functional Requirements

    Usability: The interface must be clean, intuitive, and easy to navigate.

    Performance: All updates must appear in real-time without needing a page refresh.

    Reliability: The application must be stable and available throughout the draft.

    Responsiveness: The layout must be fully usable on desktop, tablet, and mobile devices.

    Security: User authentication is required to ensure only assigned managers can control their teams.

6. Proposed Technical Stack

    Frontend: React, Vite, Tailwind CSS

    Backend & Database: Supabase

    Authentication: Supabase Auth (email-based login, associating users to their assigned teams).

    Data Source: A dedicated Supabase table initially populated from the nba_player_stats_complete.csv file.