# H5P Standalone Player 3.x [![CircleCI](https://circleci.com/gh/tunapanda/h5p-standalone.svg?style=svg)](https://circleci.com/gh/tunapanda/h5p-standalone)
Display H5P content without the need for an H5P server.

## Installation & Usage

This library can be installed and used in two main ways, depending on your project setup. After installation, ensure you have an H5P file (`.h5p`) and its contents extracted into a folder in your project. For a guide on this, see the [Extracting H5P](#extracting-h5p) section.

---
### 1. Manual Installation (Direct use in HTML)

This approach is suitable for simpler projects or when you don't have a JavaScript build pipeline. You have two options: using a CDN or downloading files.

#### A) Using a CDN (Content Delivery Network)

This is the quickest way to get started with manual installation. You can link to the player files directly from a CDN like jsDelivr.

**Include these links in your HTML:**
```html
<!-- Replace @latest with a specific version, e.g., @3.9.0, for production -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/h5p-standalone@latest/dist/styles/h5p.css">
<script src="https://cdn.jsdelivr.net/npm/h5p-standalone@latest/dist/main.bundle.js" charset="UTF-8"></script>
```
**Note:** While `@latest` gets the newest version, it's recommended to pin to a specific version in production environments to avoid unexpected updates. For example, use `h5p-standalone@3.9.0` instead of `h5p-standalone@latest`.

**Example HTML page:**
```html
<html>
</head>
<body>
	 <div id="h5p-container"></div>
	
	<script src="https://cdn.jsdelivr.net/npm/h5p-standalone@latest/dist/main.bundle.js"></script>
	
	<script>
	  document.addEventListener('DOMContentLoaded', function () {
	
	    const options = {
	      h5pJsonPath: '/path/to/your/h5p-folder', // Path to your self-hosted H5P content directory
	      frameJs: 'https://cdn.jsdelivr.net/npm/h5p-standalone@latest/dist/frame.bundle.js',
	      frameCss: 'https://cdn.jsdelivr.net/npm/h5p-standalone@latest/dist/styles/h5p.css',
	    };
	
	    const el = document.getElementById('h5p-container');
	
	    // H5PStandalone is globally available when main.bundle.js is included via a script tag
	    new H5PStandalone.H5P(el, options);
	
	  });
	</script>

</body>
</html>
```
Your H5P content (specified in `h5pJsonPath`) still needs to be hosted on your own server or accessible path.

#### B) Downloading and Self-Hosting Files

This method involves downloading the pre-built files from the releases page and hosting them yourself.

**Installation Steps:**
1.  Download the latest release source code (e.g., `h5p-standalone-vX.X.X.zip`) from the [releases page](https://github.com/tunapanda/h5p-standalone/releases/latest).
2.  Extract the downloaded zip file.
3.  Locate the `dist` folder within the extracted contents. Copy this `dist` folder into a suitable location in your project (e.g., rename it to `h5p-player` and place it in an `assets` directory like `assets/h5p-player`).

**Usage Example (Self-Hosted):**
After placing the files from the `dist` folder into your project:

1.  Add an HTML `div` element where you want to display the H5P content. This `div` must have a unique `id`.
    ```html
    <div id="h5p-container"></div>
    ```

2.  Include the H5P standalone main script (`main.bundle.js`) in your HTML page. Modify the `src` path according to where you placed the `dist` folder's contents.
    ```html
    <script type="text/javascript" src="assets/h5p-player/main.bundle.js" charset="UTF-8"></script>
    ```

3.  Call the H5P player in a subsequent script tag, providing the `id` of your `div` and paths to the H5P content and the necessary player assets (`frame.bundle.js` and `h5p.css` from your self-hosted `dist` folder contents).
    ```javascript
    document.addEventListener('DOMContentLoaded', function () {
      const el = document.getElementById('h5p-container');
      const options = {
        h5pJsonPath: '/path/to/your/h5p-folder', // Path to the extracted H5P content
        frameJs: 'assets/h5p-player/frame.bundle.js', // Path to player's frame.bundle.js
        frameCss: 'assets/h5p-player/styles/h5p.css', // Path to player's h5p.css
      };
      new H5PStandalone.H5P(el, options);
    });
    ```

---

### 2. Installation using a package manager

This method is suitable for projects that utilize a JavaScript module bundler and a build process.

#### Installation
Install the player using your favorite package manager, for example:
```bash
# pnpm
pnpm install h5p-standalone

# yarn
yarn add h5p-standalone

# npm
npm install h5p-standalone
```

#### Usage with ES6 Module Imports (e.g., in React, Vue, Svelte, Ember,Angular projects )
After installation via a package manager, you can import the player into your JavaScript modules.

Add an HTML element to your page where the H5P content will be rendered:
```html
<div id="h5p-container"></div>
```

Then, initialize the player in your JavaScript:
```javascript
import { H5P } from 'h5p-standalone'; // ES6 Import
// const { H5P } = require('h5p-standalone'); // For CommonJS environments 

const el = document.getElementById('h5p-container');
const options = {
    h5pJsonPath: '/path/to/your/h5p-folder', // Path to the extracted H5P content
    frameJs: '/assets/h5p-standalone/frame.bundle.js', // Adjust path as per your project structure
    frameCss: '/assets/h5p-standalone/styles/h5p.css', // Adjust path as per your project structure
};

new H5P(el, options);
```
**Note on `frameJs` and `frameCss` paths:** When using with a bundler, you'll need to ensure that the `frame.bundle.js` and `h5p.css` files (from the `dist` folder of this package) are copied to a location accessible by your application (e.g., your public `assets` directory) during your build process. The paths in the `options` object must then point to these served files.

---

A detailed description of all H5P player arguments, including advanced options for customization, xAPI, and state restoration, is provided in the [Advanced Usage](#advanced-usage) section.

## Working with H5P Content

H5P files (with the `.h5p` extension) are essentially zip archives. Before you can use them with this player, you need to extract their contents into a folder within your project.

**Important Note on H5P Libraries:**

Content exported directly from h5p.org might not include all the necessary H5P libraries required for the content to function correctly. This is because h5p.org optimizes exports by assuming the libraries are already present on the target platform.

If you encounter issues with missing libraries, you have a couple of options:

*   **Manually download libraries:** You might need to identify the missing libraries and download them separately from h5p.org, then place them in the appropriate H5P content folder.
*   **Use bundled H5P content:** Obtain your H5P content from a source that explicitly bundles all required libraries within the `.h5p` file.

## Advanced Usage
The standalone H5P player constructor `new H5PStandalone.H5P(el, options)` or `new H5P(el, options)` accepts two arguments:
1. An HTML element where the H5P iframe will be embedded.
2. A JSON object with the following options:

### H5P Options
1) Basic options

**Option name**|**Required**|**Description**
-----|-----|----
`h5pJsonPath`   | Yes | String. Path to the H5P content folder.
`frameCss`  | Yes | String. URL to the standalone player `h5p.css`.
`frameJs`   |Yes | String. URL to the standalone player `frame.bundle.js`.
`id`    | No | String. Player unique identifier. Randomly generated by default.
`librariesPath` | No| String. Path where the player should find the H5P content libraries. Defaults to the `h5pJsonPath`.
`contentJsonPath`|No | String. Path where the player should find the H5P `content.json` file. Defaults to  `{h5pJsonPath}/content`.
`frame` |No| Boolean. Whether to show the H5P player frame and buttons. Default is `false`.
`copyright` |No| Boolean. Whether to display the copyright button. Default is `false`.
`export` |No|  Boolean. Whether to display a download button. Default is `false`.
`icon`  |No|   Boolean. Whether to display the H5P icon. Default is `true`.
`downloadUrl` |No| String. A path or URL that provides the `.h5p` file for download. Used by the `export` button.
`fullScreen` |No| Boolean. Whether to enable the fullscreen button (if supported by the browser). Default is `false`.
`embed` |No| Boolean. Whether to display the embed button. Default is `false`. (N.B. Setting this to `true` requires `embedCode` to be provided).
`embedCode` | Yes, if `embed` is true | String. Embed/iframe code that users can copy. Placeholders `:w` and `:h` will be replaced. See [Caveats for Embed Code](#caveats-for-embed-code).
`customCss` | No | String or Array of strings. Path(s) to custom CSS file(s).
`customJs` | No | String or Array of strings. Path(s) to custom JavaScript file(s). Useful for adding external libraries. See the [Frequently Asked Questions (FAQ)](#frequently-asked-questions-faq) for detailed examples like MathJax integration.
`reportingIsEnabled` | No | Boolean. Set to `true` to enable the submit button, particularly for content like Interactive Book. Defaults to `false`.
`xAPIObjectIRI`|No| String. An identifier for a single unique Activity, utilized when generating the xAPI [object](https://github.com/adlnet/xAPI-Spec/blob/master/xAPI-Data.md#acturi) field. Defaults to page host + pathname.

2) User state & data (refer to the [Previous State Restoration](#previous-state-restoration) section for more details)

**Option name**|**Required**|**Description**
-----|-----|----
`contentUserData`| No| Array. Used to pass previously saved user state to the player. Expects an array of objects, e.g., `[{ dataType: 'state', previousState: 'JSON_STRING_OF_STATE', subContentId: '*' }]`.
`saveFreq` | Yes, if `contentUserData` or `ajax.*` is set | Number. How often (in seconds) the current user engagement content state should be autosaved. Set to `false` to disable.
`postUserStatistics` | No | Boolean. Indicates if H5P should post results upon a finish event. Default is `false`. (Requires `ajax.setFinishedUrl` to be set).
`ajax` | No | Object. Required if you need H5P to manage a learner's state via AJAX calls.
`ajax.setFinishedUrl`| No | String. URL where H5P should POST the results upon a finish event. (Requires `postUserStatistics` to be `true`).
`ajax.contentUserDataUrl`| No | String. Endpoint for H5P to GET and POST the current user state. (Requires `user` property to be set).
`user` | No | Object. Current user data object.
`user.name` | Yes, if `user` is provided | String. Name of the xAPI actor.
`user.mail` | Yes, if `user` is provided | String. Email of the user, uniquely identifying the xAPI actor.


**Note:**
- One can use absolute URL for `frameCss`, `frameJs`, and for other path options(`h5pJsonPath`,`librariesPath`, & `librariesPath`)
- Any path that starts with a forward slash `/` is treated as relative to the site root.
- Any path starting with a dot is treated to be in respect to the current page directory.
----
#### Example with Advanced Options
```javascript
import { H5P } from 'h5p-standalone';

const el = document.getElementById('h5p-container');

const options = {
    id: 'exercise-one',
    frameJs: './assets/frame.bundle.js',    // Relative path to player script
    frameCss: './assets/styles/h5p.css', // Relative path to player styles
    h5pJsonPath: '/path/to/h5p-folder',
    contentJsonPath: '/path/to/h5p-folder', // content.json is in the same folder as h5p.json
    librariesPath: '/path/to/shared/libraries', // Optional: shared libraries path
    frame: true, //required to display copyright,  embed, & export buttons
    copyright: true,
    export: false,
    icon: true,
    downloadUrl: '/path/to/exercise-one.h5p',
    fullScreen: true, //enable fullscreen button
    embed: true,
    embedCode: '<iframe width=":w" height=":h" src="https://YOURSITE/h5p-embed/exercise-one" frameBorder="0" scrolling="no" style="width:100%"></iframe>',
    customCss: [
        '/path/to/custom-styles.css',
        '/path/to/another-theme.css'
    ],
    customJs: '/path/to/your-custom-script.js', // Can be a single string or an array of strings
    reportingIsEnabled: true, // Enable submit button for content like Interactive Book
  };

new H5P(el, options)
.then(() => {
  // do stuff
});

```

### Multiple H5P players on the same page
To render multiple H5Ps, your code **must** be async aware.

```javascript
import { H5P } from 'h5p-standalone';
const player1Options = {
    h5pJsonPath: '/h5p/exercise-one',
    frameJs: '/assets/frame.bundle.js',
    frameCss: '/assets/styles/h5p.css',
};

const player2Options = {
    h5pJsonPath: '/h5p/exercise-two',
    frameJs: '/assets/frame.bundle.js',
    frameCss: '/assets/styles/h5p.css',
};

const player1 = new H5P(document.getElementById('h5p-container-1'), player1Options);

//example using top level await
await new H5P(document.getElementById('h5p-container-1'), player1Options);
await new H5P(document.getElementById('h5p-container-2'), player2Options);


```

## Listening to xAPI events
To listen for [xAPI events](https://h5p.org/documentation/api/H5P.XAPIEvent.html) emitted by the player, you must wait for the player to finish loading and initializing the required content libraries. You can find more info about xAPI events here https://h5p.org/documentation/x-api

```js

const el = document.getElementById("h5p-container");
const options = {
  h5pJsonPath: "/h5p-folder",
  frameJs: "/assets/frame.bundle.js",
  frameCss: "/assets/styles/h5p.css",
};

new H5PStandalone.H5P(el, options).then(function () {
  H5P.externalDispatcher.on("xAPI", (event) => {
    //do something useful with the event
    console.log("xAPI event: ", event);
  });
});

```

## Previous State Restoration

This section describes how to save and load a user's progress and interactions within an H5P content. This "user state" is distinct from xAPI events, which are typically used for reporting completion or scores to a Learning Record Store (LRS). Restoring user state allows learners to resume their work exactly where they left off.

There are two main approaches to manage user state with this player:

### 1. Manual User State Management

In this method, your application is responsible for saving and loading the H5P state in your preferred storage solution anywhere. You provide the previously saved state to the player via the `contentUserData` option and implement functions to retrieve and save the state as needed.

Note: The example below uses top-level `await`. You'll need to use this script in an environment that supports it, such as a JavaScript module (`<script type="module">`) or wrap the main logic in an `async` function. Also, ensure `el` (the DOM element for H5P, typically `<div id="h5p-container"></div>`) is defined in the scope where this script runs.

```javascript
function retrieveSavedContentState(contentId){
 // 👉 your implementation that returns the state for this content (and of course for this user)

// return the content or null
}

function saveContentState(contentId){
 const currentState = window.H5PIntegration.contents[`cid-${contentId}`].contentUserData;
  //👉 you can call your logic to save this state somewhere
}


const CONTENT_ID = 'some-content-unique-id-xxxxx';

const previousStateJSON = await retrieveSavedContentState(CONTENT_ID)

const options = {
	id: CONTENT_ID, //should be same as
	h5pJsonPath: '/content/course-presentation-one',
	frameJs: '/dist/frame.bundle.js',
	frameCss: '/dist/styles/h5p.css',
	saveFreq: 100, //this is required.
	contentUserData: [
  {
    dataType: 'state',
    previousState: previousStateJSON, //should be a json string.
  }
  ]
}

await new H5PStandalone(el, options); //init the h5p player.


//call above function periodically, here we are using same time as this content H5P player saving frequency (multiplied by 1000 to convert into miliseconds)
setInterval(()=>saveContentState(CONTENT_ID), options.saveFreq * 1000);
```
The `saveFreq` option in this manual setup is used to control the `setInterval` frequency; if you also have `ajax.contentUserDataUrl` configured (for automated state management), H5P core might initiate its own save attempts at this frequency too.

### 2. Automated User State Management

This method relies on the H5P player automatically saving and loading the user state from a backend endpoint that you provide and implement. For this to work, several options must be correctly configured as shown in the example below, including `saveFreq`, `ajax.contentUserDataUrl`, and the `user` object with `name` and `mail`.

**Example Configuration:**

```javascript
const options = {
  h5pJsonPath: '/content/course-presentation-one', // Path to your H5P content
  frameJs: '/dist/frame.bundle.js',     // Path to player's frame.bundle.js
  frameCss: '/dist/styles/h5p.css',   // Path to player's h5p.css

  saveFreq: 100, // Time in seconds for autosaving state
  ajax: {
    // URL for loading (GET) and saving (POST) user state.
    // :contentId is a placeholder replaced by H5P with the actual content ID.
    // Other placeholders like :dataType and :subContentId can also be used if your backend expects them.
    contentUserDataUrl: '/api/v1/h5p/history/users/123/content/:contentId'
  },
  user: { // User object is required for automated state saving
    name: 'John Doe',
    mail: 'john@example.com' // Email is used by H5P core to uniquely identify the user
  },
};

```

**Backend Implementation:**
You are responsible for implementing the backend server logic at the specified `contentUserDataUrl`.
*   **GET Request**: When H5P content loads, the player will make a GET request to this URL (with placeholders like `:contentId` replaced) to fetch the user's saved state. Your server should return the state as a JSON response, typically an array containing an object (e.g., `[{ "dataType": "state", "previousState": "{\"some\":\"json-string\"}" }]`). If no state exists for the given user and content, your endpoint should respond with an empty array (`[]`).
*   **POST Request**: When H5P needs to save the state (triggered by `saveFreq`), it will make a POST request to the `contentUserDataUrl`. The body of the POST request will contain the user state data (typically a JSON string representing the H5P state). Your server should store this data, associating it with the user and content ID.

The `contentUserDataUrl` can be structured flexibly to suit your backend routing and data model. H5P replaces known placeholders (like `:contentId`, `:dataType`, `:subContentId`) in the URL string before making the request.


### Extracting H5P
An `.h5p` file is a zip archive. To use its contents with this player:
1. Rename the H5P file extension from `.h5p` to `.zip`.
2. Extract the renamed file's contents into a folder in your project (e.g., `my-h5p-content`). This folder is what you'll point to with the `h5pJsonPath` option.

## Frequently Asked Questions (FAQ)

Here are some common issues and how to resolve them:

**Q: Why are some H5P elements missing or not working when I use content exported from h5p.org?**

Exports from h5p.org are optimized and might not bundle all the necessary H5P libraries, as they assume the libraries might already exist on the target platform.
To resolve this:
*   **Get libraries from the content type's `.h5p`:** Download the `.h5p` file for the specific content type directly from h5p.org (e.g., from the content type's example page). These files usually contain all required libraries. Extract this `.h5p` file and copy the necessary library folders (e.g., `H5P.ExampleLibrary-1.0`) into your H5P content's `libraries` folder (the one you are using for `h5pJsonPath`).
*   **Use fully bundled content:** Obtain your H5P content from a source that explicitly bundles all required libraries within the `.h5p` file.
Refer to the [Working with H5P Content](#working-with-h5p-content) section for more background.

**Q: How do I get the 'Submit' button to show up in Interactive Books (or other content types)?**

The 'Submit' button visibility on interactive book is controlled by setting `reportingIsEnabled: true` in the player options. See the `reportingIsEnabled` description in the [Advanced Usage](#advanced-usage) section for more details.

**Q: How can I display mathematical formulas or equations?**

To display mathematical formulas as described on https://h5p.org/mathematical-expressions, you'll likely need an external library like MathJax. You can load such libraries using the `customJs` option in the player configuration.
Here's how you can configure `customJs` in the player options to load MathJax:

```javascript
// Within your player options:

customJs: 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js', // Option 1: Using a CDN

// customJs: './path/to/your/local/mathjax/tex-mml-chtml.js', // Option 2: Using a local file

// customJs accepts array if you already have multiple custom scripts, i.e.:
// customJs: [
//   './scripts/my-first-custom-script.js',
//   'https://example.com/another-script.js',
//   'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js' // or your local path
// ],
```
Refer to the `customJs` description in the [H5P Options](#h5p-options) table for more details on the option itself. Remember that the path to local scripts should be relative to your HTML file or an absolute URL.


**Q: How resizer for embed code works**
- This library includes an H5P resizer by default. However, to ensure the iframe width resizes promptly with the parent page, add a CSS style setting `width: 100%` to the iframe tag itself.
- If you want to allow users to resize the iframe's width and height using H5P's resize handles, set them using the placeholders `:w` and `:h` in the `width` and `height` attributes of the iframe.

An example combining these points:
```html
<iframe width=":w" height=":h" src="https://app.wikonnect.org/embed/YOUR-CONTENT-ID" frameBorder="0" scrolling="no" style="width:100%">
</iframe>
```

## Testing during development
After cloning the repository and installing dependencies with `yarn install`, you can modify the project.
To build the distributable files:
```bash
yarn build
```
To run available [Cypress](https://www.cypress.io/) tests:
```bash
yarn test
```
