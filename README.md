# Bongo Cloud

Bongo Cloud, the cloud storage solution for the 21st Century, or not.

I started working on **Bongo Cloud** after I discovered an old laptop that was incapable of running anything but Linux.

So, I decided to turn it into a home server, and create **this project** to store files on it.

In the meantime, I was pretty interested in learning [Django](https://www.djangoproject.com/) with [Django Rest Framework](https://www.django-rest-framework.org/).

It was originally deployed on that old laptop, using Dokku and Docker, as well as various dynamic DNS tools and port forwarding configuration, to allow incoming traffic to the server.

The comedy part lies in the branding of _Bongo Cloud_; There is a single plan for all users that's free, and lets them share the 250 GB disk of the laptop.


## Features

The app implements the following:
 - Custom user authentication with JWT, middlewares for refreshing and validating tokens.
 - Filesystem with folders.
 - Sharing system, to let users share files with some or all users.
 - Modern and simple-to-use user interface built with plain React.
