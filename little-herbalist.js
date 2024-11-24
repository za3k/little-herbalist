const APPEAR_RATE = 100 // 2000
const WANTED_INGREDIENTS = 5 // Average ingredients available per gather area
const DISAPPEAR_TIME = 1000 // Visual fade duration
const DISAPPEAR_DELAY = APPEAR_RATE*WANTED_INGREDIENTS - DISAPPEAR_TIME
const SIZE = 64
const SPRITE_IDS = {
    potion: 0,
    water: 1,
    chopped: 10,
    mortar_pestle: 11,
    fire: 12,
    cauldron: 13,
    knife: 14,
    eye_dropper: 15,
    powder: 2,
    leaf: 3,
    root: 4,
    seed1: 5,
    seed: 6,
    flower: 7,
    mushroom: 8,
    ore: 9,
}
const SPRITE_NAMES = {
    water: "juice",
    eye_dropper: "dilute",
    cauldron: "heat",
    fire: "burn",
    mortar_pestle: "grind",
    knife: "separate",
    chopped: "pieces",
}
const FOREST_COLORS = [
    {h: 120 , s: 50, l: 50}, // Green
    {h: 0 ,   s: 50, l: 50}, // Red
    {h: 240 , s: 50, l: 50}, // Blue
]

class Item {
    constructor(name, type, color) {
        this.name = name
        this.color = color
        this.type = type
    }

    async make() {
        var layers = []
        const id = SPRITE_IDS[this.name]
        if (this.color) {
            layers.push(await Sprites.load(`art/bg-color/${id}_${SIZE}.png`))
            layers.push(await Sprites.load(`art/line-art/${id}_${SIZE}.png`))
        } else {
            layers.push(await Sprites.load(`art/originals/${id}_${SIZE}.png`))
        }

        const e = $(`<div class="item ${this.type} ${this.name} draggable"><label>${this.name}</label></div>`)
        for (var layer of layers) {
            e.append(layer.make())
        }
        if (this.color)
            for (var a of Object.keys(this.color))
                e.find(".sprite:nth-child(2)").css("--" + a, this.color[a])
        this.e = e
        return e
    }

    remove() {
        //this.e.remove()
    }

    isInGather() {
        return this.e.parent().hasClass("gather")
    }
}

class Game {
    constructor() {
        this.init()
    }

    chooseIngredientFor(area) {
        var type="ingredient", name, color = undefined
        if (area == "forest") {
            name = randChoice(["leaf", "seed", "root", "flower", "mushroom", "water", "ore"])
            color = randChoice(FOREST_COLORS)
            console.log(color)
        }
        return new Item(name, type, color)
    }

    async addIngredient(gatherDiv) {
        if (gatherDiv.children().length > WANTED_INGREDIENTS) return
        const ingr = this.chooseIngredientFor(gatherDiv.data("area"))
        gatherDiv.placeRandomly(await ingr.make())
        setTimeout(() => {
            if (ingr.isInGather()) ingr.remove() 
        }, DISAPPEAR_DELAY)
    }

    async init() {
        $(".gather").each(function() {
            const newThing = () => { game.addIngredient($(this)) }
            const it = aboutEvery(newThing, APPEAR_RATE)
            $(".game").on("stop", () => {
                it.clear()
            })
        })
    }
}

$(document).on("drag", ".slot .draggable", (_, e) => {
    e.dragged.css({
        "position": "",
        "left": "",
        "top": "",
    })
})

window.game = new Game()
