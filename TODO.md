# BongoDOs

### Change /files route to /-/:path

[ ] Make a route on backend to return filesystem item with subitems by path.
[ ] Implement the logic on the frontend and change the route whenever the user changes path.

Everything after `/-/` will be the path that will be requested from the api.

### Implement file-sharing.

[ ] Create a new model with the following columns:

- id (with this the users will be able to download the file)
- filesystem_item (the item being shared)
- allowed_users (a list of the users that are able to access the shared file)
- password (a password to protect the file or null)
- expiry (a date beyond which the file won't be downloadable anymore or null)

### Zipping directories for download

[ ] Use python's [zipfile](https://docs.python.org/3/library/zipfile.html) module to let users download folders.

#### Thoughts on the implementation:

When downloading (in the middleware) if the item is a folder, fetch all of its children and with a utility method add them to a zip temporarily stored in the server, send it to the user and after an x amount of time delete it.

Find a way to delete it after the serve has finished or keep it there for a few hours (ex 10), so if the user requests the same download again we don't have to re-zip it. But that will reserve valuable space.

**Don't** use compression –just store, so that we use as less cpu as possible.
