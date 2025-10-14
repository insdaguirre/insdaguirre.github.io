import requests
import json
import os
from datetime import datetime, timezone, timedelta

GITHUB_USERNAME = 'insdaguirre'
GITHUB_API = 'https://api.github.com'

def fetch_github_stats():
    headers = {
        'Authorization': f"token {os.environ.get('GITHUB_TOKEN')}",
        'Accept': 'application/vnd.github.v3+json'
    }
    
    # Fetch user data
    user_url = f"{GITHUB_API}/users/{GITHUB_USERNAME}"
    user_response = requests.get(user_url, headers=headers)
    user_data = user_response.json()
    
    # Fetch events (contributions) from last year
    events_url = f"{GITHUB_API}/users/{GITHUB_USERNAME}/events"
    events_response = requests.get(events_url, headers=headers)
    events = events_response.json() if events_response.status_code == 200 else []
    
    # Fetch repositories
    repos_url = f"{GITHUB_API}/users/{GITHUB_USERNAME}/repos?per_page=100"
    repos_response = requests.get(repos_url, headers=headers)
    repos = repos_response.json() if repos_response.status_code == 200 else []
    
    # Calculate stats
    one_year_ago = datetime.now(timezone.utc) - timedelta(days=365)
    
    # Count commits in the last year from events
    recent_commits = sum(1 for event in events 
                        if event.get('type') == 'PushEvent' 
                        and datetime.fromisoformat(event['created_at'].replace('Z', '+00:00')) > one_year_ago)
    
    # Alternative: Use GitHub's graphql API for accurate contribution count
    # For now, use a heuristic based on events and repo activity
    total_repos = len(repos)
    total_stars = sum(repo.get('stargazers_count', 0) for repo in repos)
    
    # Estimate contributions (GitHub doesn't expose this directly via REST API)
    # We'll use a conservative estimate based on recent activity
    estimated_contributions = len(events) * 2  # Rough estimate
    
    stats = {
        'last_updated': datetime.now(timezone.utc).isoformat(),
        'username': GITHUB_USERNAME,
        'public_repos': user_data.get('public_repos', 0),
        'total_stars': total_stars,
        'followers': user_data.get('followers', 0),
        'estimated_contributions_last_year': estimated_contributions,
        'recent_activity_count': len(events)
    }
    
    # Create data directory if it doesn't exist
    os.makedirs('assets/data', exist_ok=True)
    
    with open('assets/data/github-stats.json', 'w') as f:
        json.dump(stats, f, indent=2)
    
    print(f"✓ GitHub stats updated: {stats['public_repos']} repos, {stats['estimated_contributions_last_year']} contributions")

if __name__ == '__main__':
    fetch_github_stats()
