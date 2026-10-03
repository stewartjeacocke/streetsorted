# Street Sorted frontend

This is a Jekyll static site. Use Ruby 3.3 and Bundler:

```bash
bundle install
bundle exec jekyll serve
```

Set `api_origin` in `_config.yml` to the HTTPS Node.js backend origin for deployment. Publish the
built `_site/` output with normal immutable asset caching; do not cache HTML pages so an API-origin
configuration release is picked up promptly.
