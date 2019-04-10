# Custom Embed Reference Implementation

## Overview

This project is a reference implementation of the ARC Custom Embeds plugin.
It consists of the host application, hosting an iframe and plugins. All communication goes through browser postMessage API. There are 3 types of plugin:

- Search Plugin
- View Plugin
- Edit Plugin

Having all plugins in place gives authoring application an ability to use any third party media system transparently with the ability to search media, view it and make any changes in it.

> This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.
