# BongoDOs

### Change /files route to /-/:path

[x] Make a route on backend to retrieve filesystem item by path.
[x] Implement the logic on the frontend and change the route whenever the user changes path.

Everything after `/-/` will be the path that will be requested from the api.

#### Problem that needs to be solved:

When the user visits the site with a url the has a path (ex. bongo-cloud.ga/-/**my/folder**) the page renders two times and makes two requests to the server to find the id of the requested item from the path. Some higher level component causes it to re-render.

### Letting the user cancel upload or download operations.

[x] Abort XMLHttpRequest when the up/download notification gets closed from the user.

### Implement file-sharing.

[x] Create a new model with the following columns:

- id (with this the users will be able to download the file)
- filesystem_item (the item being shared)
- allowed_users (a list of the users that are able to access the shared file)
- password (a password to protect the file or null)
- expiry (a date beyond which the file won't be downloadable anymore or null)

[-] Create api views to create, retrieve and **delete** shares.

[x] Replace the middleware we currently have to download files with a new api endpoint.

[x] Implement functionality on frontend.

[ ] When trying to share a file that's already shared fail and alert user.

[x] Limit the things the api returns (for example, don't return the allowed_users, is_expired or parent and download_url for item) and add the user that shares.

### Zipping directories for download

[ ] Use python's [zipfile](https://docs.python.org/3/library/zipfile.html) module to let users download folders.

#### Thoughts on the implementation:

When downloading (in the middleware) if the item is a folder, fetch all of its children and with a utility method add them to a zip temporarily stored in the server, send it to the user and after an x amount of time delete it.

Find a way to delete it after the serve has finished or keep it there for a few hours (ex 10), so if the user requests the same download again we don't have to re-zip it. But that will reserve valuable space.

**Don't** use compression –just store, so that we use as less cpu as possible.
