const APPEAR_RATE = 2000
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
const WHITE = { h: 0, s:100, l: 200 }

class Icon {
    constructor(name, classes, color) {
        this.name = name
        this.classes = `icon ${classes} ${this.name}`

        // Make the element
        var layers = []
        const id = SPRITE_IDS[this.name]
        if (color) {
            layers.push(sprites[`art/bg-color/${id}_${SIZE}.png`])
            layers.push(sprites[`art/line-art/${id}_${SIZE}.png`])
        } else {
            layers.push(sprites[`art/originals/${id}_${SIZE}.png`])
        }

        this.e = $(`<div class="${this.classes}"><label>${this.name}</label></div>`)
        this.e.data("item", this)
        for (var layer of layers) this.e.append(layer.make())
        this.color = color
    }

    set color(color) {
        this._color = color
        if (color)
            for (var a of Object.keys(this.color))
                this.e.find("> .sprite:nth-child(2)").css("--" + a, this.color[a])
    }
    get color() { return this._color }

    async fadeOut() {
        // TODO: Cool fade
        this.e.remove()
    }

    async fadeReplace(other) {
        // TODO: Cool fade
        this.e.replace(other)
    }

    async fadeIn() {
        // TODO: Cool fade
    }

    isInGather() {
        return this.e.parent().hasClass("gather")
    }

    async countdownTimer(delay) {
        // TODO: A delay and cool countdown timer
        return
    }

    async create(delay) {
        await this.fadeIn()
        await countdownTimer(delay)
    }

    async destroy(delay) {
        await countdownTimer(delay)
        this.fadeOut()
    }

    async transform(delay, newItem, processName) {
        await countdownTimer(delay)
        this.e.replace(newItem)
        this.fadeReplace(newItem.e)
    }
}

class Slot {
    constructor() {
        this.e = $(`<div class="slot drop-slot"></div>`)
    }

    set(item) {
        this.e.empty().append(item.e)
    }

    get() {
        const i = this.e.find(".item")
        if (i) return i.data(".item")
    }
}

class Equipment {
    constructor(name, iconName, action) {
        this.name = iconName
        this.e = $(`<div class="equipment ${iconName}"><label>${name}</label></div>`)
        $(".lab").append(this.e)
        this.init(iconName, action, iconName == "potion" ? WHITE : undefined)
    }
    
    set color(color) {
        this.icon.color = color
    }

    set slot(item) {
        this.dropSlot.set(item)
    }

    get slot() {
        return this.dropSlot.get()
    }

    onItemPlaced(f) {
        this.dropSlot.e.on("dragTo", (_, e) => {
            const item = e.dragged.data('item')
            f(item)
        })
    }

    onAction(f) {
        this.action.on("click", f)
    }

    init(name, action, color) {
        this.icon = new Icon(name, "equipment", color)
        this.e.append(this.icon.e)

        this.dropSlot = new Slot()
        this.icon.e.append(this.dropSlot.e)

        if (action) {
            this.action = $(`<div class="action">${action}</div>`)
            this.e.append(this.action)
        }
    }
}

class Item extends Icon{
    constructor(name, classes, color) {
        super(name, "item draggable " + classes, color)
    }

}

class Game {
    constructor() {
        this.init()
        this.potion = { color: WHITE, amount: 0, ingredients: [] }
    }

    blend(color1, amt1, color2, amt2) {

        // Weighted circular mean finds the midway point considering the angles as point on a unit circle. Then, it works backwards from that point to the angle.
        const sin = Math.sin(deg2rad(color1.h)) * amt1 + Math.sin(deg2rad(color2.h)) * amt2
        const cos = Math.cos(deg2rad(color1.h)) * amt1 + Math.cos(deg2rad(color2.h)) * amt2
        const h = rad2deg(Math.atan2(sin, cos)) % 360

        const s = (color1.s * amt1 + color2.s * amt2) / (amt1 + amt2)
        const l = (color1.l * amt1 + color2.l * amt2) / (amt1 + amt2)
        return {h,s,l}
    }

    async startBrew(ingredient) {
        console.log("Start Brew", ingredient)
        await ingredient.fadeOut()

        const amount = this.potion.amount
        const color1 = this.potion.color
        const color2 = ingredient.color
        const newColor = this.blend(color1, amount, color2, 1)
        console.log({amount, color1, color2, newColor})
        this.potion.amount += 1
        this.potion.ingredients.push(ingredient)
        this.brewing.color = this.potion.color = newColor
    }

    finishBrew() {
        console.log("Finish Brew")

        const flask = new Item("potion", "cure", this.potion.color)
        flask.ingredients = this.potion.ingredients
        this.brewing.slot = flask

        this.potion = { color: WHITE, amount: 0, ingredients: [] }
        this.brewing.color = WHITE
    }

    chooseIngredientFor(area) {
        var type="ingredient", name, color = undefined
        if (area == "forest") {
            name = randChoice(["leaf", "seed", "root", "flower", "mushroom", "water", "ore"])
            color = randChoice(FOREST_COLORS)
        }
        return new Item(name, type, color)
    }

    addIngredient(gatherDiv) {
        if (gatherDiv.children().length > WANTED_INGREDIENTS) return
        const ingr = this.chooseIngredientFor(gatherDiv.data("area"))
        gatherDiv.placeRandomly(ingr.e)
        setTimeout(() => {
            if (ingr.isInGather()) ingr.fadeOut() 
        }, DISAPPEAR_DELAY)
    }

    init() {
        $(".gather").each(function() {
            const newThing = () => { game.addIngredient($(this)) }
            const it = aboutEvery(newThing, APPEAR_RATE)
            $(".game").on("stop", () => {
                it.clear()
            })
        })
        $(".action.finish-brew").on("click", () => { this.finishBrew() })

        this.brewing = new Equipment("Brewing Stand", "potion", "Finish Brewing")
        this.brewing.onAction(this.finishBrew.bind(this))
        this.brewing.onItemPlaced(this.startBrew.bind(this))
    }
}

// Main
(async function() {
    window.sprites = {}
    for (var id of Object.values(SPRITE_IDS)) {
        const paths = [
            `art/bg-color/${id}_${SIZE}.png`,
            `art/line-art/${id}_${SIZE}.png`,
            `art/originals/${id}_${SIZE}.png`,
        ]
        for (var path of paths)
            sprites[path] = await Sprites.load(path)
    }
    window.game = new Game()
}
)()
