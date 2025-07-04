# atomazu.org

This repository contains the source code for my personal website and blog, [blog.atomazu.org](https://blog.atomazu.org).

This README is up to date as of [6fc4bc6](https://github.com/atomazu/atomazu.org/commit/6fc4bc60f79ee9efff169fd3fb84d76cb1d9d8ea).

## Project Overview

This project is a dual-purpose repository that includes both the frontend and backend for the website.

-   **Frontend**: A static site built with HTML, CSS, and vanilla JavaScript. It fetches and displays blog posts from the backend API.
-   **Backend**: A Node.js application using Express.js. It serves a REST API for managing blog posts, which are stored as Markdown files with front-matter.

## Features

-   **Blog**: The core of the site is a blog where I post about various topics, primarily related to Japanese language learning.
-   **REST API**: The backend provides a simple API for creating, reading, updating, and deleting blog posts.
-   **Markdown-based**: Blog posts are written in Markdown, making them easy to write and manage.
-   **Simple Authentication**: The API is protected by a simple token-based authentication system.

## Tech Stack

-   **Frontend**:
    -   HTML5
    -   CSS3
    -   Vanilla JavaScript (ESM)
-   **Backend**:
    -   Node.js
    -   Express.js
    -   `marked` for Markdown to HTML conversion
    -   `gray-matter` for parsing front-matter from Markdown files

## Getting Started

### Prerequisites

-   Node.js and npm installed.

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/atomazu/atomazu.org.git
    cd atomazu.org
    ```
2.  Install the dependencies:
    ```bash
    npm install
    ```

### Running the application

1.  Create a `.env` file in the root of the project and add the following environment variables:

    ```
    PORT=3000
    TOKEN=your_secret_token
    ```

2.  Start the server:

    ```bash
    npm start
    ```

The application will be available at `http://localhost:3000`.

## API Endpoints

The API is available under the `/posts` prefix.

-   `GET /posts`: Get a list of all blog posts.
-   `GET /posts/:slug`: Get a single blog post by its slug.
-   `POST /posts`: Create a new blog post (requires authentication).
-   `PUT /posts/:slug`: Update a blog post (requires authentication).
-   `DELETE /posts/:slug`: Delete a blog post (requires authentication).
-   `POST /posts/:slug/like`: Increment the like count for a post.
-   `GET /auth/validate`: Validate the authentication token.

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
