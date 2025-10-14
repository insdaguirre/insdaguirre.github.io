import requests
import json
import os
from datetime import datetime, timezone

GITHUB_USERNAME = 'insdaguirre'
GITHUB_API = 'https://api.github.com/graphql'

def fetch_github_stats():
    token = os.environ.get('PERSONAL_ACCESS_TOKEN')
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    # GraphQL query for accurate contribution stats
    query = """
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
          }
        }
        repositories(first: 100, ownerAffiliations: OWNER) {
          totalCount
          nodes {
            defaultBranchRef {
              target {
                ... on Commit {
                  history {
                    totalCount
                  }
                }
              }
            }
          }
        }
      }
    }
    """
    
    variables = {'username': GITHUB_USERNAME}
    
    response = requests.post(
        GITHUB_API,
        json={'query': query, 'variables': variables},
        headers=headers
    )
    
    if response.status_code == 200:
        data = response.json()
        
        # Check if we got the expected data structure
        if 'data' not in data or data['data'] is None:
            print(f"✗ GitHub API returned unexpected data structure: {data}")
            return
        
        user_data = data['data']['user']
        
        # Get total contributions from last year
        total_contributions = user_data['contributionsCollection']['contributionCalendar']['totalContributions']
        
        # Calculate total commits across all repos
        total_commits = sum(
            repo['defaultBranchRef']['target']['history']['totalCount']
            for repo in user_data['repositories']['nodes']
            if repo.get('defaultBranchRef') and repo['defaultBranchRef'].get('target')
        )
        
        stats = {
            'last_updated': datetime.now(timezone.utc).isoformat(),
            'username': GITHUB_USERNAME,
            'public_repos': user_data['repositories']['totalCount'],
            'total_commits': total_commits,
            'contributions_last_year': total_contributions
        }
        
        os.makedirs('assets/data', exist_ok=True)
        
        with open('assets/data/github-stats.json', 'w') as f:
            json.dump(stats, f, indent=2)
        
        print(f"✓ GitHub stats updated: {total_commits} total commits, {total_contributions} contributions last year")
    else:
        print(f"✗ GitHub API error: {response.status_code}")
        print(f"Response: {response.text}")

if __name__ == '__main__':
    fetch_github_stats()
