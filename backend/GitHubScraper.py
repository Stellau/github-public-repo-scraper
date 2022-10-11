# Name: Stella Lau
# Start Date: 09/27/2022

import requests
import re
from bs4 import BeautifulSoup

class GitHubScraper:
    """
    A class used to scrape GitHub users' names and public repositories information

    ...

    Attributes
    ----------
    BASE_URL : str
        the link to general GitHub's website

    Methods
    -------
    scrapeProfile(self, *usernames)
        given a list of GitHub usernames, return the users' actual names and
        public repositories information in a JSON object
    """

    BASE_URL = 'https://github.com/'

    def scrapeProfile(self, *usernames):
        """
        Description
        -----------
        Scrapes the users' information and their public repositories' information given their usernames.
        Parameters
        ----------
        usernames : str[]
            One or more GitHub usernames provided by users
        Returns
        -------
        result
            a JSON object that contains the users' actual names and
            public repositories information
        """
        results = {}
        results['users'] = []
        for username in usernames:
            # username would have been validated in the front end with regular expression
            url = self.BASE_URL + username
            params = {
                'tab': 'repositories',
                'type': 'public'
            }
            page = requests.get(url, params=params)
            page.raise_for_status()
            # instantiate a beautifulsoup object
            soup = BeautifulSoup(page.content, "html.parser")
            # find the name of the user
            name = soup.find('span', itemprop="name")
            # find all the titles, dates can be added later once everything is working
            titles = soup.find_all('a', itemprop="name codeRepository")
            times = soup.find_all('relative-time')
            # create a user object to store their information
            user = {}
            user['username'] = username
            user['name'] = re.sub('\n +', '', name.text)
            user['projects'] = []
            for title, time in zip(titles, times):
                project = {}
                # format project object
                project['name'] = re.sub('\n +', '', title.text)
                formated_time = re.sub('T', ' ', time['datetime'])
                formated_time = re.sub('Z', '', formated_time)
                project['time'] = formated_time
                user['projects'].append(project)
            results['users'].append(user)
        return results

# for testing
# scraper = GitHubScraper()
# print(scraper.scrapeProfile('stellau'))