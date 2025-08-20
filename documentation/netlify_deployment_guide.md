# Netlify Deployment Guide (CLI)

This guide outlines the steps to deploy the Renegades Draft application to Netlify using the Netlify CLI, especially when continuous deployment from GitHub is not configured.

## Prerequisites

*   **Netlify CLI installed:** Ensure you have the Netlify CLI installed globally. You can check by running `netlify --version`. If not installed, run `npm install -g netlify-cli`.
*   **Netlify Account:** You must have a Netlify account and be logged in via the CLI. You can log in using `netlify login`.
*   **Project Directory:** Ensure you are in the root directory of your project (`Renegades Draft`) when running these commands.

## Deployment Steps

Follow these steps to deploy your application:

1.  **Ensure Local Main Branch is Up-to-Date:**
    Before deploying, ensure your local `main` branch is synchronized with your GitHub repository.
    ```bash
    git fetch
    git status
    ```
    If there are any untracked files you wish to include, add and commit them:
    ```bash
    git add <file_path>
    git commit -m "Commit message"
    ```
    Then push your changes to GitHub:
    ```bash
    git push
    ```

2.  **Link Local Directory to Netlify Project:**
    If your local project directory is not already linked to your Netlify site, you need to link it. This command will guide you through an interactive process to select your existing Netlify project.
    ```bash
    netlify link
    ```
    *   When prompted "How do you want to link this folder to a project?", select **"Choose from a list of your recently updated projects"** or **"Search by full or partial project name"** and then select `renegades-draft`.
    *   The CLI will confirm once the directory is linked.

3.  **Deploy to Netlify Production:**
    Once the directory is linked, you can deploy your application to production. The `netlify.toml` file in your project's root directory (`renegades-draft-central/netlify.toml`) will be used to determine the build command and publish directory.

    The command will automatically trigger the build process defined in your `netlify.toml` (`cd renegades-draft-central && npm run build`) and then upload the contents of the `renegades-draft-central/dist` directory.

    ```bash
    netlify deploy --prod
    ```
    *   The CLI will show the build progress and then the upload progress.
    *   Once complete, it will provide the production URL and a unique deploy URL.

## Updating the App with New Changes

To update the live application on Netlify after making changes to your local codebase, follow these steps:

1.  **Make Your Changes:** Implement the desired changes in your project files.
2.  **Commit Changes:** Stage and commit your changes to your local Git repository.
    ```bash
    git add .
    git commit -m "Descriptive commit message"
    ```
3.  **Push to GitHub:** Push your local commits to your GitHub repository.
    ```bash
    git push
    ```
4.  **Deploy to Netlify:** From the root directory of your project (`Renegades Draft`), run the deploy command. This will trigger a new build and deploy the updated version to Netlify.
    ```bash
    netlify deploy --prod
    ```

## Verifying Deployment

After the deployment is complete, you can verify the changes:

*   Visit your production URL: `https://renegades-draft.netlify.app`
*   Check the specific deploy URL provided by the CLI for this deployment (e.g., `https://<unique-hash>--renegades-draft.netlify.app`)
*   Access the build logs on your Netlify dashboard for detailed information: `https://app.netlify.com/projects/renegades-draft/deploys/<deploy-id>`

This process ensures that your Netlify site is updated with the latest changes from your local repository, even without continuous deployment enabled via GitHub.
