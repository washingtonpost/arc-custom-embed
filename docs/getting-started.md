# Composer Custom Embed: Getting Started

## Use Cases

Custom Embeds is a feature for Arc Composer (formerly Ellipsis) that allows developers to build content elements in stories that store an embedded link to a piece of content that lives outside Arc.

## Requirements

To follow along with this guide, you will need:

* Basic knowledge of HTML, Javascript, and the web
* Basic knowledge of Arc Composer and [ANS](https://www.github.com/washingtonpost/ans-schema)
* Basic experience with React components and content sources in PageBuilder Fusion
* Permissions to administer and configure both Composer and PageBuilder Fusion in your Arc environment.
* A working Fusion environment, complete with origin and public internet domain name. (I.e., you can see your fusion code running at www.mysite.com)

## Goal

This guide will demonstrate how to build a "Movie" custom embed using [OMDB](https://www.omdbapi.com/).

At the end of this guide, you will know how to:
* Create a content source in Fusion that proxies to their external content
* Create a search panel in Composer for users to find external content
* Create a view panel in Composer for users to see external content embedded in their story
* Create an edit panel in Composer for users to configure presentation options for the embed
* Render a custom embed in Fusion so that readers can see the content inline

## Limitations and Warnings

The Custom Embeds workflow is made up of "panels." Currently, these panels must reside on the *public internet*. This means that they are accessible by anyone in the world with internet access. Therefore we ask that you adhere to a few key restrictions:

* The content exposed in these panels should only include published, public content. You should not search against unpublished content, data that is private to an organization or an individual, or content with legal restrictions placed on it.
* None of these panels should write or modify the data they expose in the data's original source. The panels function only by sending and receiving data from Composer via the user's browser. All edited data should be saved within the Composer ANS document, and nowhere else.

## Steps

### 1. Identify or create endpoints for your external data.

Your external data source should provide public GET endpoints as specified above for fetching and searching for content.
These may already exist, or in some cases you may be able to create them yourself.

This guide will use the [OMDB API](https://www.omdbapi.com/) as an example data source.

Here's an example endpoint for fetching content by ID:

* https://www.omdbapi.com/?apikey=YOUR_API_KEY_HERE&plot=full&i=tt3969158

Here's an example endpoint for search for content by name:

* https://www.omdbapi.com/?apikey=YOUR_API_KEY_HERE&s=Jurassic

> **What about *my* content?**
>
> To implement an Arc Composer Custom Embed for your external content, your data source will need to:
>
> * ...expose an HTTP GET endpoint for fetching content metadata by id
> * ...expose an HTTP GET endpoint for querying for content in your content source as a Composer user would
>   * ...**without** exposing confidential, unpublished or otherwise private content or data
>   * ...and **without** submitting new contnet or modifying content in the external data source
>
> These last two restrictions are in place because your endpoints will be indirectly exposed on the **public internet**,
> so it important that they do not expose anything that is not already discoverable on the web.



### 2. Build a content source in PageBuilder Fusion

We'll need two content sources set up in Fusion.

The first content source will be used for rendering a single embed on the website as well as the view and edit panels. It will need to fetch a piece of content by id and return its metadata.

Let's modify the existing movie-find content source from the Fusion recipes to accept an `id` parameter in addition to the `title` parameter.

```javascript
/*    /content/sources/movie-find.js    */

import { OMDB_API_KEY } from 'fusion:environment'

const resolve = (query) => {
  const requestUri = `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&plot=full`

  if (query.hasOwnProperty('movieTitle')) {
    return `${requestUri}&t=${query.movieTitle}`
  } else if (query.hasOwnProperty('imdbID')) {
    return `${requestUri}&i=${query.imdbID}`
  }

  throw new Error('movie-find content source requires a movieTitle or imdbID')
}

export default {
  resolve,
  params: {
    movieTitle: 'text',
    imdbID: 'text'
  }
}
```

This will allow us to make client-side calls like the following in our Composer Custom Embed:
`/pf/api/v3/content/fetch/movie-find?query={"imdbID":"tt0107290"}`


We'll need one additional content source for our search panel to find a list of movies that match a certain title. Let's create a new content source `movie-search`:

```javascript
/*    /content/sources/movie-search.js    */

import { OMDB_API_KEY } from 'fusion:environment'

const resolve = (query) => {
  const requestUri = `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&plot=full`

  let query_string = ''

  if (query.hasOwnProperty('text')) {
    query_string = `${requestUri}&s=${query.text}&type=movie`
  }
  else {
    throw new Error('movie-search content source requires text')
  }

  if (query.hasOwnProperty('year')) {
    query_string += `&y={query.year}`
  }

  return query_string
}

export default {
  resolve,
  params: {
    text: 'text',
    year: 'text'
  }
}

```




> **Why do this? Why not use the public endpoints?**
>
> * It allows our external content to leverage Fusion's object caching, preventing your external content from getting overwhelmed with requests.
> * It prevents your API key from being exposed client-side.
> * It allows you to do your entire rendering of the external content server-side, or client-side, as you'll soon see.

### 3. Create a search panel for your custom embed.

We can get started by copying the [starter search code](https://raw.githubusercontent.com/washingtonpost/arc-custom-embed/master/public/starter/search.html). The best practice is to save static html files to /resources/plugins/composer/embeds/movie/search.html

Note: It is required that all static html files to be saved in the `/resources/plugins/composer` directory. If saved outside of this folder, a deployment version parameter (d) will be requested, and will have to be updated with every deployment, making it unmaintainable.


Unfortunately, this base embed doesn't do very much. We'll need to add functionality.

First, let's define our search form. Our users only really want to find movies by name, so we'll stick to a single text field and a Search button.

Edit the section under `<!-- Search Form -->` to be the following:

```html
          <!-- Search Form -->
          <h1 class="jumbotron-heading text-dark">
            Movie Finder
          </h1>
          <p class="lead text-muted">
            Let's go to the movies
          </p>
          <p class="lead">
          </p>
          <label for="searchTitle">Title:
            <input type="textfield" id="searchTitle" name="searchTitle" />
          </label>
          <input type="button" name="Search" value="Search" onclick="handleSearch()" />
```

That's straightforward. But it still doesn't do very much. So let's go implement handleSearch().

Here's where things get interesting. We can now call the content source we built in Step 2 to retrieve data for our search results. We can use the Fusion HTTP endpoint for fetching data from a content source. Let's check the data first to make sure we know what the data from our content source looks like. Hit this URL in your browser:

http://localhost/pf/api/v3/content/fetch/movie-search?query={%22text%22:%22Jurassic%22}

This gives us back data like:

```json
{"Search":[{"Title":"Jurassic Park","Year":"1993","imdbID":"tt0107290","Type":"movie","Poster":"https://m.media-amazon.com/images/M/MV5BMjM2MDgxMDg0Nl5BMl5BanBnXkFtZTgwNTM2OTM5NDE@._V1_SX300.jpg"},{"Title":"Jurassic World","Year":"2015","imdbID":"tt0369610","Type":"movie","Poster":"https://m.media-amazon.com/images/M/MV5BNzQ3OTY4NjAtNzM5OS00N2ZhLWJlOWUtYzYwZjNmOWRiMzcyXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg"},{"Title":"The Lost World: Jurassic Park","Year":"1997","imdbID":"tt0119567","Type":"movie","Poster":"https://m.media-amazon.com/images/M/MV5BMDFlMmM4Y2QtNDg1ZS00MWVlLTlmODgtZDdhYjY5YjdhN2M0XkEyXkFqcGdeQXVyNTI4MjkwNjA@._V1_SX300.jpg"},{"Title":"Jurassic Park III","Year":"2001","imdbID":"tt0163025","Type":"movie","Poster":"https://m.media-amazon.com/images/M/MV5BZDMyZGJjOGItYjJkZC00MDVlLWE0Y2YtZGIwMDExYWE3MGQ3XkEyXkFqcGdeQXVyNDYyMDk5MTU@._V1_SX300.jpg"},{"Title":"Jurassic World: Fallen Kingdom","Year":"2018","imdbID":"tt4881806","Type":"movie","Poster":"https://m.media-amazon.com/images/M/MV5BNzIxMjYwNDEwN15BMl5BanBnXkFtZTgwMzk5MDI3NTM@._V1_SX300.jpg"},{"Title":"Jurassic Shark","Year":"2012","imdbID":"tt2071491","Type":"movie","Poster":"https://m.media-amazon.com/images/M/MV5BODI1ODAyODgtZDYzZS00ZTM2LTg5MzMtZjNjMDFjMzlkZGQ2XkEyXkFqcGdeQXVyMTg0MTI3Mg@@._V1_SX300.jpg"},{"Title":"Jurassic City","Year":"2015","imdbID":"tt2905674","Type":"movie","Poster":"https://m.media-amazon.com/images/M/MV5BMjM1MzUyMTk5MV5BMl5BanBnXkFtZTgwOTc2NzA0NDE@._V1_SX300.jpg"},{"Title":"The Jurassic Games","Year":"2018","imdbID":"tt6710826","Type":"movie","Poster":"https://m.media-amazon.com/images/M/MV5BZWJkMzE4ZTAtOTY1ZS00YmZjLWI2MzQtZTg4MzdiN2U4NmUyXkEyXkFqcGdeQXVyMTUwMzY1MDM@._V1_SX300.jpg"},{"Title":"Jurassic Prey","Year":"2015","imdbID":"tt3469284","Type":"movie","Poster":"https://m.media-amazon.com/images/M/MV5BMTQ4MDg1NDkyNl5BMl5BanBnXkFtZTgwNTY3MTM2NDE@._V1_SX300.jpg"},{"Title":"The Making of 'Jurassic Park'","Year":"1995","imdbID":"tt0256908","Type":"movie","Poster":"https://m.media-amazon.com/images/M/MV5BMjlhY2Y5NGYtZDdlMS00YzhhLWJhNzQtNWYzNTQzZDJjNGU2XkEyXkFqcGdeQXVyODY0NzcxNw@@._V1_SX300.jpg"}],"totalResults":"98","Response":"True","_id":"8e7343a11b4e2286a9ec0b93495aa3f3c618deeba43fbc45f0f92919f3853ade"}
```

Alright, so we know what the data looks like and how to retrieve it. It's straightforward from there to write a client-side call to this endpoint.

Edit the handleSearch function to be:

```javascript

     const handleSearch = () => ({
       // 1. Make an Ajax call to content source
       // 2. Set data based on response
       // 3. Re-render search results
       const searchTerm = document.getElementById('searchTitle').value;

       superagent
         .get('/pf/api/v3/content/fetch/movie-search')
         .query({ query: JSON.stringify({"text":searchTerm})})
         .set('Accept', 'application/json')
         .then(res => {
           data = res.body.Search
           render()
         });
     })

```

This will make the Ajax call back to Fusion to retrieve our movie data. But we still need to show the results! So let's fill out that template and render function to include a movie image, id, title and year. (the .Poster, .imdbID, .Title and .Year fields, respectively, from our data source.)

Set the search result template to be:

```html
    <template id="content_template">
      <!-- Rendered Search Result Item -->
      <div class="col-md-6 hoverable" id="%item_id%">
        <div class="card mb-6 box-shadow">
          <img
            class="card-img-top"
            src="%image_id%"
            alt="Card image cap"
          />
          <div class="card-body">
            <p class="card-text text-muted">
              <label style="display: block; font-weight: bold"><span>%text%</span></label>
              <label style="display: block"><span>%year%</span></label>
            </p>
          </div>
        </div>
      </div>
    </template>
```

And we'll tweak the `render()` function just a bit to insert the data into this template:

```javascript
     const render = () => {
       // Show search results to user
       const template = document.getElementById('content_template').innerHTML
       document.getElementById('search_content').innerHTML = '';

       for (i = 0; i < data.length; i++) {
         const html = template
           .replace('%item_id%', 'row-' + data[i].imdbID)
           .replace('%image_id%', data[i].Poster)
           .replace('%text%', data[i].Title)
           .replace('%year%', data[i].Year)
         const element = document.createElement('div')
         document.getElementById('search_content').appendChild(element)
         element.outerHTML = html
         document
           .getElementById('row-' + data[i].imdbID)
           .addEventListener('click', handleClick(i))
       }
     }
```

The search button shows results now. All that's left to do is let the user select one and send the data back to Ellipsis.

Change handleClick to be:

```javascript
     const handleClick = index => event => {
       // Send message back to Composer about selected item
       // message must contain:
       // {
       //   "id": (content item id - string)
       //   "url": (content source identifier - string)
       //   "config": (contextual metadata - object)
       // }

       const ansCustomEmbed = {
         id: data[index]['imdbID'],
         url: 'https://www.imdb.com/title/',
         config: {
           "show_poster": true,
           "caption": "No caption specified"
         }
       }

       sendMessage('data', ansCustomEmbed)
     }
```

The data format we are returning here is based part of the ans [custom embed element](https://github.com/washingtonpost/ans-schema/blob/master/src/main/resources/schema/ans/0.10.3/story_elements/custom_embed.json) schema.

Finally, we can test our whole flow by using the online custom embed testing tool. Visit the testing tool, select the config options, and set the search page to be http://localhost/pf/resources/plugins/composer/search.html.


### 4. Create an edit panel for your custom embed.

The search panel is working, but we still need to let users attach some contextual metadata to an embed. For that, we need to define an edit panel.

Copy [starter edit code](https://raw.githubusercontent.com/washingtonpost/arc-custom-embed/master/public/starter/edit.html) to /resources/plugins/composer/embeds/movie/edit.html

Note: It is required that all static html files to be saved in the `/resources/plugins/composer` directory. If saved outside of this folder, a deployment version parameter (d) will be requested, and will have to be updated with every deployment, making it unmaintainable.


For our movie embeds, we'll let users control two things: whether or not to display the movie poster image, and to set an optional caption or tagline about the movie.

We can start by building a form to set those options.

```html
          <!-- Edit Form -->
          <div class="row" id="config_edit">
            <div class="col-md-6">
              <label for="caption"><span>Caption</span>
                <input id="caption" name="caption" type="textfield" value="" />
              </label>
            </div>
            <div class="col-md-6">
              <label><span style="font-weight:bold">Poster</span></label><br />
              <label for="poster_yes">
                <input id="poster_yes" name="show_poster" type="radio" value="true"  />
                <span>Show Poster</span>
              </label>
              <label for="poster_no">
                <input id="poster_no" name="show_poster" type="radio" value="false"  />
                <span>Do Not Show Poster</span>
              </label>
            </div>
            <div class="col-md-6 p-3">
              <button type="button" class="btn btn-primary" id="btn_apply">
                Apply Changes
              </button>
              <button type="button" class="btn btn-light mx-1" id="btn_cancel">
                Close Editor
              </button>
            </div>
          </div>
```

We'll also need to show a rendering of the content with the configuration options factored in. This requires fetching the data and rendering it alongside the configuration options.

We can update `fetchData` to retrieve the content based on the content id passed in via query parameters. Note that this time we're pulling from the movie-find content source instead of movie-search.

```javascript
     // Retrieve the content data based on parameters
     const fetchData = (ansCustomEmbed) => {
       superagent
         .get('/pf/api/v3/content/fetch/movie-find')
         .query({ query: JSON.stringify({"imdbID":ansCustomEmbed.id})})
         .set('Accept', 'application/json')
         .then(res => {
           content = res.body
           render(content, data.config)
         });
     }
```

That render function doesn't do anything, so let's make a template and use it.

Edit the content template to be:

```html
      <!-- Rendered Item -->
      <div class="col-md-12" id="%item_id%">
        <div class="card mb-4 box-shadow" style="flex-direction: row"
          id="content_card">
          <img
            id="content_image"
            class="card-img-top"
            style="max-height: 220px; width: auto"
            src="%image_id%"
            alt="Card image cap"
          />
          <div class="card-body">
            <p class="card-text text-muted" style="font-weight: bold">
              %text%
            </p>
            <p class="card-text text-muted">
              %year%
            </p>
            <p class="card-text text-muted">
              "%caption%"
            </p>
          </div>
        </div>
      </div>
      <div class="col-md-12">
        <div style="font-weight: bold">JSON Response to Composer</div>
        <pre>%data%</pre>
      </div>

```

And pull it all together in `render`:

```javascript
     // Render the content data and contextual configuration together
     const render = (content, config) => {

       // Setup Element Preview
       const template = document.getElementById('content_template').innerHTML
       const html = template
         .replace('%item_id%', 'row-' + content.imdbID)
         .replace('%image_id%', content.Poster)
         .replace('%text%', content.Title)
         .replace('%year%', content.Year)
         .replace('%caption%', (config.caption ? config.caption : ""))
         .replace('%data%', JSON.stringify(data, null, 2))

       const element = document.createElement('div')
       document.getElementById('content_holder').innerHTML = ''
       document.getElementById('content_holder').appendChild(element)
       element.outerHTML = html

       if (config.show_poster && config.show_poster === false) {
         document.getElementById('content_card').removeChild(
           document.getElementById('content_image')
         )
       }

       // Update form state
       document.getElementById('poster_yes').checked = (!!config.show_poster)
       document.getElementById('poster_no').checked = (!config.show_poster)

       document.getElementById('caption').value = (config.caption ? config.caption : "")
     }

```

Finally, we need to make the Apply Changes button send the data back to Composer. It should read the form state, update the config object and send the whole data package back.


```javascript
     // Update config based on form changes, submit back to Composer and re-render
     const applyChanges = () => {
       data.config.show_poster = document.getElementById('poster_yes').checked
       data.config.caption = document.getElementById('caption').value

       // Update Composer and re-render form
       sendMessage('data', data)
       render(content, data.config)
     }

```


That's it for editing! We can test it using the same test tool we used for search.


### 5. Create a view panel for your custom embed.

Phew! The hardest part is over. The search and edit panels are working. But we still need to tell Composer how to display the embed to writers, editors and content producers when it's embedded in a document. The view panel controls how the embed displays when it's at rest.

Copy the [starter view code](https://raw.githubusercontent.com/washingtonpost/arc-custom-embed/master/public/starter/view.html) to /resources/plugins/composer/embeds/movie/view.html

Note: It is required that all static html files to be saved in the `/resources/plugins/composer` directory. If saved outside of this folder, a deployment version parameter (d) will be requested, and will have to be updated with every deployment, making it unmaintainable.


This one's a little easier -- a lot can be borrowed from the edit panel. Instead of a form, we just need to tell our view panel how to fetch and render content by id. We'll use the movie-find content source again, along with the config object passed in.

Fetch data looks the same as in edit panel:

```javascript
     const fetchData = (ansCustomEmbed) => {
       superagent
         .get('/pf/api/v3/content/fetch/movie-find')
         .query({ query: JSON.stringify({"imdbID":ansCustomEmbed.id})})
         .set('Accept', 'application/json')
         .then(res => {
           data = res.body
           render(data, ansCustomEmbed.config)
         });
     }
```

And the only remaining steps are adding the template and render function.

```html
      <div class="col-md-12" id="%item_id%">
        <div class="card mb-4 box-shadow" style="flex-direction: row"
          id="content_card"
        >
          <img
            id="content_image"
            class="card-img-top"
            style="max-height: 220px; width: auto"
            src="%image_id%"
            alt="Card image cap"
          />
          <div class="card-body">
            <p class="card-text text-muted" style="font-weight: bold">
              %text%
            </p>
            <p class="card-text text-muted">
              %year%
            </p>
            <p class="card-text text-muted">
              "%caption%"
            </p>
          </div>
        </div>
```

```javascript
     const render = (data, config) => {
       const template = document.getElementById('content_template').innerHTML
       const html = template
         .replace('%item_id%', 'row-' + data.imdbID)
         .replace('%image_id%', data.Poster)
         .replace('%text%', data.Title)
         .replace('%data%', JSON.stringify(data, null, 2))
         .replace('%year%', data.Year)
         .replace('%caption%', (config.caption ? config.caption : ""))

       const element = document.createElement('div')
       document.getElementById('search_content').appendChild(element)
       element.outerHTML = html

       if (config && (config.show_poster === false)) {
         document.getElementById('content_card').removeChild(
           document.getElementById('content_image')
         )
       }
     }

```

Once again, we can test using the test tool.


### 6. Deploy code to a development environment.

To wire these panels up in Composer, you'll need to host them on a public domain. Just zip up a bundle like you usually would and deploy to a test environment.

Once they're uploaded, you can wire up Composer to use the panels in the settings page. See [these instructions](https://redirector.arcpublishing.com/alc/arc-products/ellipsis/user-docs/ellipsis-custom-embed-power-ups-for-rich-third-party-content/#Configuring-a-Custom-Embed-Integration).

Save a few documents with the embed in them, then go look at those documents published on the web.

### 7. Create an appropriate feature component in PageBuilder Fusion.

Wait...there's nothing there? Ah, geeze, we forgot to write a Fusion feature for actually rendering these things!

Fortunately it's not too hard to add. We already have the right content sources configured, after all.

Let's update our movie-detail component (from the Fusion recipes) to utilize our content source and configuration options.

```javascript
@Consumer
class MovieDetail extends Component {
  constructor (props) {
    super(props)
    this.state = {
      movie:  {}
    }
    this.fetch = this.fetch.bind(this)
    this.fetch()
  }

  fetch() {
    const { movie } = this.state
    const { imdbID, caption, show_poster } = this.props
    this.fetchContent({
      movie: {
        source: 'movie-find',
        query: { imdbID: imdbID },
        transform: (data) => {
          return Object.assign(
            {},
            data,
            {
              Poster: show_poster ? data.Poster : null,
              caption: caption
            }
          )
        }
      }
    })
    this.render()
  }

  render () {

    const { Actors, Director, Plot, Poster, Rated, Title, Writer, Year, caption } = this.state.movie || {}

    return (
      <div className='movie-detail col-sm-12 col-md-8'>
        <div className="card" style={{"flexDirection": "row", display: "flex"}}>
          {Poster && Title && <div className="card-img-top"><img src={Poster} alt={`Poster for ${Title}`} /></div>}

          <div
            className="card-body"
            style={{ margin: "0 10px" }}
            >
            {Title && <h1>{Title}</h1>}
            {Year && <p><strong>Year:</strong> {Year}</p>}
            {caption && <blockquote>"{caption}"</blockquote>}

          </div>
        </div>
      </div>
    )
  }
}

MovieDetail.label = 'Movie Detail'

export default MovieDetail

```

A few things have changed here. Our component now takes `imdbID`, `caption` and `show_poster` as props. It no longer uses the global content source. The `caption` and `show_poster` fields are factored into the render function. But most importantly, `imdbID` is used as an argument to our content source. This is pretty cool!


We're not quite done, though. We'll need to tell our feature pack that custom embeds are a valid content element to appear in an article body. So let's find our article body feature (the location and code varies by project) and add this to our content element switch statement:

```javascript
                        case 'custom_embed':
                          return <CustomEmbedBody element={element} />
```

We'll also need to import the component at the top, perhaps like:

```
import CustomEmbedBody from './_children/custom-embed'
```

And we'll need to implement the custom embed component as well.

```javascript
'use strict'

/* Third party libs */
import React, { Component } from 'react'

/* Components */
import MovieDetail from '../../../movies/movie-detail'

/* Other JS */

/* Non-JS resources */


class CustomEmbedBody extends Component {

  render() {

    return (
      <div className="customEmbed">
        <MovieDetail
          imdbID={this.props.element.embed.id}
          caption={this.props.element.embed.config.caption}
          show_poster={this.props.element.embed.config.show_poster}
          />

      </div>
    )
  }
}


export default CustomEmbedBody
```

This component is pretty basic for now, but it would be a good place in the future to `switch` between multiple custom embed types, once we have them. In the meantime, it extracts the relevant fields from our custom embed and passes them into the updated movie detail component.

And voila! Our movies appear inline in our articles!


### 9. Deploy the whole thing to sandbox and production, and enable the configs.

One benefit of implementing the custom embed panels in Fusion is that they become part of our deployment bundle! So you can change the Composer config options, the content source, and the reader rendering all at once, without any gap time.

Just zip up the bundle and deploy to each environment as you normally would. Remember that the first time you deploy to each environment, you'll also need to enable the appropriate Ellipsis configs.

That's it for now. We can't wait to see what you do with this!
