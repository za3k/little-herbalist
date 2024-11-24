function randInt(min, max) {
    return Math.floor(Math.random()*(max-min) + min)
}

function randChoice(arr) {
    return arr[randInt(0, arr.length)]
}

function randFloat(min, max) {
    return Math.random()*(max-min) + min
}

function randPercent() {
    return randFloat(0, 100)
}

function aboutEvery(f, avgDelay) {
    const interval = setInterval(f, avgDelay)
    return {
        clear: () => { clearInterval(interval) }
    }
}

if (jQuery) {
    jQuery.fn.placeRandomly = function(x) {
        this.append(x)
        // Don't go outside the border
        const left = randFloat(0, (this.width() - $(x).width()) / this.width()) * 100
        const top = randFloat(0, (this.height() - $(x).height()) / this.height()) * 100
        $(x).css({
            left: `${left}%`,
            top:`${top}%`,
            position: "absolute",
        })
        return this
    }
}
