for x in {0..15}; do
    cp originals/$x.png originals/${x}_16.png
    magick originals/${x}.png -scale 200% originals/${x}_32.png
    magick originals/${x}.png -scale 400% originals/${x}_64.png

    for size in 16 32 64; do
        icon="${x}_${size}"
        # Line art (no yellow)
        magick originals/${icon}.png -transparent 'rgb(255,242,0)' line-art/${icon}.png

        # Color (only yellow part, change to hsl(0, 50%, 50%) )
        magick originals/${icon}.png -fill "rgba(0,0,0,0)" +opaque 'rgb(255,242,0)' -fill "rgb(191, 64, 64)" -opaque 'rgba(255,242,0)' bg-color/${icon}.png
    done
done
