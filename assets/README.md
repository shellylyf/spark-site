# Assets

`_src/` holds your untouched originals (449 MB). It is NOT served —
exclude it from any deploy. Everything else here is the web-optimised set.

## In place ✅

| File               | Source            | Size  | Used by                    |
|--------------------|-------------------|-------|----------------------------|
| `logo.svg`         | Web-Logo.svg      | 14 KB | Nav, top-left              |
| `collage-1.jpg`    | Spark_Final-1.png | 355 KB| Stack card 1, top-left     |
| `collage-2.jpg`    | Spark_Final-2.png | 467 KB| Stack card 1, top-right    |
| `collage-3.jpg`    | Spark_Final-4.png | 427 KB| Stack card 1, bottom-left  |
| `collage-4.jpg`    | Spark_Final-3.png | 410 KB| Stack card 1, bottom-right |
| `panel.mp4`        | Spark_Demo.mp4    | 14 MB | Stack card 2 (demo)        |
| `panel-poster.jpg` | frame @1.2s       | 451 KB| panel.mp4 poster           |
| ~~`archive.jpg`~~   | Spark_Final-3.png | 721 KB| UNUSED — panel 3 is now the live map embed |

## Still needed ❌

| File              | What it is                          | Spec                      |
|-------------------|-------------------------------------|---------------------------|
| `hero.mp4`        | The aerial road clip behind the h1  | 1920px wide, muted, loops |
| `hero-poster.jpg` | First frame of hero.mp4             | same aspect as the video  |

The hero is the only thing still loading from Framer's CDN.

Panel 3 embeds https://shellylyf.github.io/spark-map/ in an iframe, so it
needs no local asset. `archive.jpg` is now unused — delete it if you like.

## Re-running the optimisation

```
sips -Z 1400 -s format jpeg -s formatOptions 80 _src/NAME.png --out out.jpg
ffmpeg -i _src/NAME.mp4 -an -vf scale=1600:-2 -c:v libx264 -crf 24 \
       -preset medium -pix_fmt yuv420p -movflags +faststart out.mp4
```
