![Reactive Resume](https://i.imgur.com/FFc4nyZ.jpg)

![App Version](https://img.shields.io/github/package-json/version/AmruthPillai/Reactive-Resume?label=version)
[![Docker Pulls](https://img.shields.io/docker/pulls/amruthpillai/reactive-resume)](https://hub.docker.com/repository/docker/amruthpillai/reactive-resume)
[![GitHub Sponsors](https://img.shields.io/github/sponsors/AmruthPillai)](https://github.com/sponsors/AmruthPillai)
[![Crowdin](https://badges.crowdin.net/reactive-resume/localized.svg)](https://crowdin.com/project/reactive-resume)
[![Discord](https://img.shields.io/discord/1173518977851473940?label=discord&link=https%3A%2F%2Fdiscord.gg%2FhzwkZbyvUW)](https://discord.gg/hzwkZbyvUW)

# Reactive Resume

A free and open-source resume builder that simplifies the process of creating, updating, and sharing your resume.

### [Go to App](https://rxresu.me/) | [Docs](https://docs.rxresu.me/)

## Description

Reactive Resume is a free and open-source resume builder that simplifies the process of creating, updating, and sharing your resume. With zero user tracking or advertising, your privacy is a top priority. The platform is extremely user-friendly and can be self-hosted in less than 30 seconds if you wish to own your data completely.

It's available in multiple languages and comes packed with features such as real-time editing, dozens of templates, drag-and-drop customisation, and integration with OpenAI for enhancing your writing.

You can share a personalised link of your resume to potential employers, track its views or downloads, and customise your page layout by dragging-and-dropping sections. The platform also supports various font options and provides dozens of templates to choose from. And yes, there's even a dark mode for a more comfortable viewing experience.

Start creating your standout resume with Reactive Resume today!

## Templates

| Azurill                                                      | Bronzor                                                     | Chikorita                                                   |
| ------------------------------------------------------------ | ----------------------------------------------------------- | ----------------------------------------------------------- |
| <img src="https://i.imgur.com/jKgo04C.jpeg" width="200px" /> | <img src="https://i.imgur.com/DFNQZP2.jpg" width="200px" /> | <img src="https://i.imgur.com/Dwv8Y7f.jpg" width="200px" /> |

| Ditto                                                       | Kakuna                                                      | Nosepass                                                    |
| ----------------------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------- |
| <img src="https://i.imgur.com/6c5lASL.jpg" width="200px" /> | <img src="https://i.imgur.com/268ML3t.jpg" width="200px" /> | <img src="https://i.imgur.com/npRLsPS.jpg" width="200px" /> |

| Onyx                                                        | Pikachu                                                     | Rhyhorn                                                     |
| ----------------------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------- |
| <img src="https://i.imgur.com/cxplXOW.jpg" width="200px" /> | <img src="https://i.imgur.com/Y9f7qsh.jpg" width="200px" /> | <img src="https://i.imgur.com/h4kQxy2.jpg" width="200px" /> |

## Features

- **Free, forever** and open-source
- No telemetry, user tracking or advertising
- You can self-host the application in less than 30 seconds
- **Available in multiple languages** ([help add/improve your language here](https://translate.rxresu.me/))
- Use your email address (or a throw-away address, no problem) to create an account
- You can also sign in with your GitHub or Google account, and even set up two-factor authentication for extra security
- Create as many resumes as you like under a single account, optimising each resume for every job application based on its description for a higher ATS score
- **Bring your own OpenAI API key** and unlock features such as improving your writing, fixing spelling and grammar or changing the tone of your text in one-click
- Translate your resume into any language using ChatGPT and import it back for easier editing
- Create single page resumes or a resume that spans multiple pages easily
- Customize the colours and layouts to add a personal touch to your resume
- Customise your page layout as you like just by dragging-and-dropping sections
- Create custom sections that are specific to your industry if the existing ones don't fit
- Jot down personal notes specific to your resume that's only visible to you
- Lock a resume to prevent making any further edits (useful for master templates)
- **Dozens of templates** to choose from, ranging from professional to modern
- Design your resume using the standardised EuroPass design template
- Supports printing resumes in A4 or Letter page formats
- Design your resume with any font that's available on [Google Fonts](https://fonts.google.com/)
- **Share a personalised link of your resume** to companies or recruiters for them to get the latest updates
- You can track the number of views or downloads your public resume has received
- Built with state-of-the-art (at the moment) and dependable technologies that's battle tested and peer reviewed by the open-source community on GitHub
- **MIT License**, so do what you like with the code as long as you credit the original author
- And yes, there's a dark mode too 🌓

## Built With

- React (Vite), for the frontend
- NestJS, for the backend
- Postgres (primary database)
- Minio (for object storage: to store avatars, resume PDFs and previews)
- Browserless (for headless chrome, to print PDFs and generate previews)
- SMTP Server (to send password recovery emails)
- GitHub/Google OAuth (for quickly authenticating users)
- LinguiJS and Crowdin (for translation management and localization)

## Local Development Setup

To set up the project for local development, follow these steps:

1. **Clone the Repository**
   ```bash
   git clone https://github.com/AmruthPillai/Reactive-Resume.git
   cd Reactive-Resume
   ```

2. **Setup Environment Variables**
   ```bash
   cp .env.example .env
   ```
   The default values in `.env.example` should work fine for local development.

3. **Install Dependencies**
   ```bash
   pnpm install
   ```

4. **Start Development Services**
   Start the required services (database, storage, etc.) using Docker Compose:
   ```bash
   docker compose -f compose.dev.yml up -d
   ```

5. **Start Development Servers**
   Start both the frontend and backend development servers:
   ```bash
   pnpm dev
   ```

After completing these steps, the development server should be running at `http://localhost:5173` for the frontend and `http://localhost:3000` for the backend API.

### Querying the Local Database

There are two ways to access and query the local PostgreSQL database:

1. **Using Adminer (Recommended)**
   - Open `http://localhost:5555` in your browser
   - Use these credentials to login:
     ```
     System: PostgreSQL
     Server: postgres
     Username: postgres
     Password: postgres
     Database: postgres
     ```
   - Once logged in, you can browse tables, execute SQL queries, and manage the database through the web interface

2. **Using PostgreSQL CLI**
   - Connect to the database through Docker:
     ```bash
     docker compose -f compose.dev.yml exec postgres psql -U postgres -d postgres
     ```
   - Useful PostgreSQL commands:
     ```sql
     -- List all tables in the database
     postgres=# \dt
     
     -- Describe the structure of a specific table (e.g., User table)
     postgres=# \d "User"
     
     -- Query all users from the User table
     postgres=# SELECT * FROM "User";
     
     -- Query specific columns from User table
     postgres=# SELECT id, email, name FROM "User";
     
     -- Query with conditions
     postgres=# SELECT * FROM "User" WHERE email LIKE '%@example.com';
     
     -- Count total users
     postgres=# SELECT COUNT(*) FROM "User";
     
     -- List all resumes for a specific user
     postgres=# SELECT * FROM "Resume" WHERE "userId" = 'your-user-id';
     
     -- Exit the PostgreSQL CLI
     postgres=# \q
     ```

## Star History

<a href="https://star-history.com/#AmruthPillai/Reactive-Resume&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=AmruthPillai/Reactive-Resume&type=Date&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=AmruthPillai/Reactive-Resume&type=Date" />
    <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=AmruthPillai/Reactive-Resume&type=Date" />
  </picture>
</a>

## License

Reactive Resume is packaged and distributed using the [MIT License](/LICENSE.md) which allows for commercial use, distribution, modification and private use provided that all copies of the software contain the same license and copyright.

_By the community, for the community._  
A passion project by [Amruth Pillai](https://www.amruthpillai.com/)

<p>
  <a href="https://www.digitalocean.com/?utm_medium=opensource&utm_source=Reactive-Resume">
    <img src="https://opensource.nyc3.cdn.digitaloceanspaces.com/attribution/assets/PoweredByDO/DO_Powered_by_Badge_blue.svg" width="200px">
  </a>
</p>
