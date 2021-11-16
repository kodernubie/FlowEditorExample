class FlowBuilder {

    onCreate = null
    onSelect = null

    constructor(canvas) {

        this.canvas = canvas
        this.readOnly = false

        this.classMap = new Map()
        this.classMap["FlowStart"] = FlowStart
        this.classMap["FlowEnd"] = FlowEnd
        this.classMap["FlowSendMsg"] = FlowSendMsg
        this.classMap["FlowSendButton"] = FlowSendButton
        this.classMap["FlowSendEmail"] = FlowSendEmail
        this.classMap["FlowSendList"] = FlowSendList
        this.classMap["FlowWaitResponse"] = FlowWaitResponse
        this.classMap["FlowValidation"] = FlowValidation 
        this.classMap["FlowBranch"] = FlowBranch
        this.classMap["FlowHttpCall"] = FlowHttpCall
        
        
        this.canvas.style.overflow = "scroll"
        this.canvas.style.position = "relative"

        var obj = this
        canvas.onmousedown = function(e) {
 
            var posX = parseFloat(e.clientX - (obj.canvas.getBoundingClientRect().left  * (obj.zoom / 100)) + obj.canvas.scrollLeft) * (100/obj.zoom); 
            var posY = parseFloat(e.clientY - (obj.canvas.getBoundingClientRect().top  * (obj.zoom / 100)) + obj.canvas.scrollTop) * (100/obj.zoom);
            

            if (e.srcElement == obj.canvas) {

                if (!obj.readOnly) {
                    
                    if (obj.currentComponent != "pointer")
                        obj.addComponent(posX, posY)
                }
            } else {

                var target = obj.getCompononentByPos(posX, posY)

                if (target != undefined) {

                    if (obj.selectedComp != undefined) {

                        obj.selectedComp.unselect()
                    }

                    obj.selectedComp = target

                    if (!obj.readOnly) {
                        target.select()
                    }

                    if (obj.onSelect != undefined) {

                        obj.onSelect(target)
                    }
                }
            }
        }

        canvas.onmousemove = function(e) {
            
            if (!obj.readOnly) {

                
                if (obj.moveComponent != undefined) {

                    obj.moveComponent.frame.style.left = (parseFloat(obj.moveComponent.frame.style.left) + ((e.pageX - obj.moveX) * (100/obj.zoom))) + "px"
                    obj.moveComponent.frame.style.top = (parseFloat(obj.moveComponent.frame.style.top) + ((e.pageY - obj.moveY) * (100/obj.zoom))) + "px"
                    
                    obj.moveComponent.updateLink(undefined)

                    for (var i in obj.componentList) {

                        if (obj.componentList[i] != obj.moveComponent)
                            obj.componentList[i].updateLink(obj.moveComponent)
                    }

                    obj.moveX = e.pageX
                    obj.moveY = e.pageY

                } else if (obj.linkComponent != undefined) {

                    var posX = (e.pageX - obj.linkX) * (100/obj.zoom)
                    var posY = (e.pageY - obj.linkY) * (100/obj.zoom)

                    obj.linkComponent.renderLink(obj.linkPoint, posX, posY)
                }
            }
        }

        canvas.onmouseup = function(e) {

            var posX = parseFloat(e.clientX - (obj.canvas.getBoundingClientRect().left  * (obj.zoom / 100)) + obj.canvas.scrollLeft) * (100/obj.zoom) 
            var posY = parseFloat(e.clientY - (obj.canvas.getBoundingClientRect().top  * (obj.zoom / 100)) + obj.canvas.scrollTop) * (100/obj.zoom)
                
            console.log(posX, posY)

            if (!obj.readOnly) {
            
                if (obj.linkComponent != undefined) {
                    
                    var target = obj.getCompononentByPos(posX, posY)

                    obj.linkComponent.setLink(obj.linkPoint, target)
                }
            }

            obj.moveComponent = undefined
            obj.linkComponent = undefined
        }

        // canvas.ondblclick = function(e) {

        //     var posX = parseInt(e.clientX - obj.canvas.getBoundingClientRect().left + obj.canvas.scrollLeft)
        //     var posY = parseInt(e.clientY - obj.canvas.getBoundingClientRect().top + obj.canvas.scrollTop)
            
        //     var target = obj.getCompononentByPos(posX, posY)

        //     if (target != undefined) {

        //         if (obj.onSelect != undefined) {

        //             obj.onSelect(target)
        //         }
        //     }
        // }

        this.init()
    }

    getNodePosition(node) {

        var ret = {
            x : parseInt(node.offsetLeft),
            y : parseInt(node.offsetTop)
        }

        console.log(ret)

        if (node.parentElement != null) {

            var parPos = this.getNodePosition(node.parentElement)

            ret.x = ret.x + parPos.x
            ret.y = ret.y + parPos.y
        }

        return ret
    }    

    init() {

        this.inInit = true
        this.selectedComp = undefined

        this.variables = ["response", "customerName", "customerNo"]

        this.canvas.innerHTML = ""
        this.setActiveComponent("pointer")
        
        this.componentList = []
        this.canvas.innerHTML = "<div style='position: absolute; left: 4000px; top: 2000px'>&nbsp;</div>"

        this.currentComponent = "FlowStart"
        this.addComponent(20, 20)

        this.currentComponent = "FlowEnd"
        this.addComponent(220, 120)

        this.inInit = false

        this.canvas.style.zoom = "100%"
        this.zoom = 100
    }

    resetZoom() {

        this.zoom = 100
        this.canvas.style.zoom = this.zoom + "%"
    }

    zoomIn() {

        console.log("prev " + this.zoom)
        
        if (this.zoom < 100) {
            this.zoom += 10
        } else {
            this.zoom += 50
        } 
    
        this.canvas.style.zoom = this.zoom + "%"
    }

    zoomOut() {

        console.log("prev " + this.zoom)

        if (this.zoom > 10) {

            if (this.zoom <= 100) {
                this.zoom -= 10
            } else {
                this.zoom -= 50
            }
    
            this.canvas.style.zoom = this.zoom + "%"
        }
    }

    getVariables() {

        return this.variables
    }

    addVariable(varName) {

        this.variables.push(varName)
    }

    delVariable(varName) {

        var newList = []

        for (var i in this.variables) {

            if (this.variables[i] != varName) {

                newList.push(this.variables[i])
            } 
        }

        this.variables = newList
    }

    clearVariable() {

        this.variables = []
    }

    delete(comp) {

        this.selectedComp = undefined
        
        if (this.onSelect != undefined) {

            this.onSelect(undefined)
        }

        var newArr = new Array()

        for (var i in this.componentList) {

            if (this.componentList[i] != comp) {

                newArr.push(this.componentList[i])
            }
        }

        this.componentList = newArr

        for (var i in this.componentList) {

            this.componentList[i].updateLink(undefined)
        }
    }

    escapeStr(str) {
        return str
            .replace(/[\\]/g, '\\\\')
            .replace(/[\"]/g, '\\\"')
            .replace(/[\/]/g, '\\/')
            .replace(/[\b]/g, '\\b')
            .replace(/[\f]/g, '\\f')
            .replace(/[\n]/g, '\\n')
            .replace(/[\r]/g, '\\r')
            .replace(/[\t]/g, '\\t');
    }

    getScript() {

        var ret = `
            {
                "flow" : [
        `

        var cmpScript = ""

        for (var i in this.componentList) {

            cmpScript += `, 
            ` + this.componentList[i].getScript()
        }

        if (cmpScript != "") {

            cmpScript = cmpScript.substring(1)
        }

        ret += cmpScript + `
                ],
        `

        var varScript = ""

        for (var i in this.variables) {

            varScript += ",\"" + this.escapeStr(this.variables[i]) + "\""
        }

        if (varScript != "") {

            varScript = varScript.substring(1)
        }

        ret += `
                "variables" : [` + varScript + `]
            }
        `

        return ret
    }

    loadScript(script) {

        var ret = false
        this.init()

        try {

            var obj = JSON.parse(script)

            this.variables = obj["variables"]

            var flowNode = obj["flow"]

            for (var i in flowNode) {

                var comp = undefined

                if (flowNode[i]["type"] == "FlowStart") {

                    comp = this.getComponentById("START") 
                } else if (flowNode[i]["type"] == "FlowEnd") {

                    comp = this.getComponentById("END") 
                } else {

                    this.currentComponent = flowNode[i]["type"]
                    comp = this.addComponent(0, 0)
                }

                if (comp != undefined) {

                    comp.loadData(flowNode[i])
                } 
            }

            for (var i in this.componentList) {

                this.componentList[i].updateLink(undefined)
            }

            ret = true
        } catch (e) {

            console.log(e)
        }

        return ret
    }

    startMove(component, e) {

        if (!this.readOnly) {

            this.moveX = e.pageX
            this.moveY = e.pageY

            this.moveComponent = component
        }
    }

    startLink(component, point, e) {

        if (!this.readOnly) {

            this.linkComponent = component
            this.linkPoint = point
            
            this.linkX = e.pageX - e.layerX + 10
            this.linkY = e.pageY - e.layerY + 5
        }
    }

    setActiveComponent(componentClass) {

        this.currentComponent = componentClass
    }

    addComponent(x, y) {
        
        var component = undefined
        var cls = this.classMap[this.currentComponent]
        
        if (cls != undefined) {

            component = new cls(this, x, y)
            this.componentList.push(component)

            if (!this.inInit) {

                if (this.onCreate != undefined) {

                    this.onCreate(component)
                }
            }            
        }

        return component
    }

    getCompononentByPos(x, y) {

        var ret = undefined

        for (var i = this.componentList.length - 1; i >= 0; i--) {

            if ((x > this.componentList[i].frame.offsetLeft) && 
                (x < (this.componentList[i].frame.offsetLeft + this.componentList[i].frame.offsetWidth)) &&
                (y > this.componentList[i].frame.offsetTop) && 
                (y < (this.componentList[i].frame.offsetTop + this.componentList[i].frame.offsetHeight))) {

                    ret = this.componentList[i]
                    break
                }
        }

        return ret
    }

    getComponentById(id) {

        var ret = undefined

        for (var i in this.componentList) {

            if (this.componentList[i].id == id) {

                ret = this.componentList[i]
                break
            }
        }

        return ret
    }

    setReadOnly(readOnly) {

        this.readOnly = readOnly

        if (readOnly) {

            this.moveComponent = undefined

            if (this.linkComponent != undefined) {
            
                this.linkComponent.setLink(this.linkPoint, undefined)
            } 

            this.linkComponent = undefined

            if (this.selectedComp != undefined) {

                this.selectedComp.unselect()
            }

            this.selectedComp = undefined
        }
    }
}

class FlowBaseComponent {
 
    constructor(fb, x, y) {

        this.fb = fb
        this.id = this.UUID()

        this.outPointList = new Array()

        this.frame = document.createElement("DIV")
        this.frame.style = `position: absolute; 
                            width: 160px; 
                            background: #FFFFFF; 
                            border-radius: 5px;
                            padding: 10px;
                            box-shadow: 0px 2px 4px #888888;
        `

        this.frame.style.left = x + "px"
        this.frame.style.top = y + "px"
        fb.canvas.appendChild(this.frame)

        this.titleDiv = document.createElement("DIV")
        this.titleDiv.style = `
                            font-family: Helvetica, Arial, Sans-Serif;
                            font-size: 13px;
                            font-weight: bold;
                            cursor: move;
                            user-select: none; 
                            line-height: 20px;
        `
        
        this.titleDiv.innerHTML = `
            <div>
                <img width="20" height="20" style="user-select: none; vertical-align: top; margin-right: 3px" src="` + flowAsset[this.getType()] + `">
                <span style="vertical-align: top;user-select: none;">` + this.getTitle() + `<span>
            </div>
        `

        var obj = this
        this.titleDiv.onmousedown = function(e) {

            obj.fb.startMove(obj, e)
        }

        this.frame.appendChild(this.titleDiv)

        this.closeImg = document.createElement("IMG")
        this.closeImg.width = 32
        this.closeImg.height = 32
        this.closeImg.src = flowAsset["close"]
        this.closeImg.style = `position: absolute; 
                                left: 164px;
                                top: -16px;
                                cursor: pointer;
                                display: none;
        `

        var obj = this
        this.closeImg.onclick = function(e) {

            obj.fb.delete(obj)
            obj.frame.remove()
        }

        this.frame.appendChild(this.closeImg)
    }

    select() {

        this.closeImg.style.display = ""
    }

    unselect() {

        this.closeImg.style.display = "none"
    }


    getType() {
        return "FlowBaseComponent"
    }

    loadData(data) {

        this.frame.style.left = data["left"] + "px"
        this.frame.style.top = data["top"] + "px"

        this.id = data["id"]

        this.loadDetailData(data["data"])
    }

    loadDetailData(data) {

    }

    UUID() {
        var nbr, randStr = "";
        do {
            randStr += (nbr = Math.random()).toString(16).substr(3, 6);
        } while (randStr.length < 30);
        return (
            randStr.substr(0, 8) + "-" +
            randStr.substr(8, 4) + "-4" +
            randStr.substr(12, 3) + "-" +
            ((nbr*4|0)+8).toString(16) + // [89ab]
            randStr.substr(15, 3) + "-" +
            randStr.substr(18, 12)
        );
    }
    
    getTitle() {

        return "Component"
    }

    getNodePosition(node) {

        var ret = {
            x : parseInt(node.offsetLeft),
            y : parseInt(node.offsetTop)
        }

        if ((node.parentElement != null) &&  (node.parentElement != this.frame)) {

            var parPos = this.getNodePosition(node.parentElement)

            ret.x = ret.x + parPos.x
            ret.y = ret.y + parPos.y
        }

        return ret
    }    

    addOutPoint(parent) {

        var point = {}

        point.frame = document.createElement("DIV")
        point.frame.style = `
                            position: absolute;
                            width: 10px;
                            height: 10px;
                            top: calc(50% - 5px);
                            left: calc(100% - 15px);
                            border: 1p solid #FFFFFF;
                            border-radius: 5px;
                            background: #4EC99B; 
                            user-select: none; 
                            cursor: pointer;
        `

        parent.appendChild(point.frame)

        point.frame.innerHTML = `
            <div style='position: absolute; display: none'>&nbsp</div>
            <div style='position: absolute; display: none'>&nbsp</div>
            <div style='position: absolute; display: none'>&nbsp</div>
            <div style='position: absolute; display: none'>&nbsp</div>
            <div style='position: absolute; display: none'>&nbsp</div>
        `

        var obj = this
        point.frame.onmousedown = function(e) {

            obj.fb.startLink(obj, point, e)
        }

        this.outPointList.push(point)

        return point
    }

    getInPoint() {

        var ret = {
            x : parseInt(this.frame.style.left),
            y : parseInt(this.frame.style.top) + 15
        }

        return ret
    }

    updateLink(target) {

        for (var i in this.outPointList) {

            if (target == undefined) {

                this.setLink(this.outPointList[i], this.fb.getComponentById(this.outPointList[i].targetId))

            } else if (this.outPointList[i].targetId == target.id) {

                this.setLink(this.outPointList[i], target)
            }
        }
    }

    setLink(point, target) {

        if ((target == undefined) || (target == this)) {

            point.targetId = undefined

            var box1 = point.frame.firstElementChild
            var box2 = box1.nextElementSibling
            var box3 = box2.nextElementSibling
            var box4 = box3.nextElementSibling
            var box5 = box4.nextElementSibling

            box1.style.display = "none"
            box2.style.display = "none"
            box3.style.display = "none"
            box4.style.display = "none"
            box5.style.display = "none"
        } else {

            point.targetId = target.id

            var targetPoint = target.getInPoint()

            var pointPos = this.getNodePosition(point.frame)

            pointPos.x = pointPos.x + parseInt(this.frame.style.left)
            pointPos.y = pointPos.y + parseInt(this.frame.style.top)

            targetPoint.x = targetPoint.x - pointPos.x - 10
            targetPoint.y = targetPoint.y - pointPos.y - 5

            this.renderLink(point, targetPoint.x, targetPoint.y)
        }
    }

    renderLink(point, posX, posY) {

        var box1 = point.frame.firstElementChild
        var box2 = box1.nextElementSibling
        var box3 = box2.nextElementSibling
        var box4 = box3.nextElementSibling
        var box5 = box4.nextElementSibling

        if ((posX > 5) && (posY < 0)) {
            // top right

            box1.style.display = ""
            box1.style.left = "10px"
            box1.style.top = "5px"
            box1.style.width = (posX / 2) + "px"
            box1.style.height = "1px"
            box1.style.borderLeft = "1px solid rgba(0, 0, 0, 0)"
            box1.style.borderTop = "1px solid rgba(0, 0, 0, 1)"
            box1.style.borderRight = "1px solid rgba(0, 0, 0, 0)"
            box1.style.borderBottom = "1px solid rgba(0, 0, 0, 0)"

            box2.style.display = ""
            box2.style.left = ((posX / 2) + 11) + "px"
            box2.style.top = (posY + 5) + "px"
            box2.style.width =  "1px"
            box2.style.height = (-posY - 1) + "px"
            box2.style.borderLeft = "1px solid rgba(0, 0, 0, 1)"
            box2.style.borderTop = "1px solid rgba(0, 0, 0, 0)"
            box2.style.borderRight = "1px solid rgba(0, 0, 0, 0)"
            box2.style.borderBottom = "1px solid rgba(0, 0, 0, 0)"

            box3.style.display = ""
            box3.style.left = box2.style.left
            box3.style.top = box2.style.top
            box3.style.width = (posX / 2) + "px"
            box3.style.height = "1px"
            box3.style.borderLeft = "1px solid rgba(0, 0, 0, 0)"
            box3.style.borderTop = "1px solid rgba(0, 0, 0, 1)"
            box3.style.borderRight = "1px solid rgba(0, 0, 0, 0)"
            box3.style.borderBottom = "1px solid rgba(0, 0, 0, 0)"

            box4.style.display = "none"
            box5.style.display = "none"    
        } else if ((posX > 5) && (posY > 0)) {
            // bottom right

            box1.style.display = ""
            box1.style.left = "10px"
            box1.style.top = "5px"
            box1.style.width = (posX / 2) + "px"
            box1.style.height = "1px"
            box1.style.borderLeft = "1px solid rgba(0, 0, 0, 0)"
            box1.style.borderTop = "1px solid rgba(0, 0, 0, 1)"
            box1.style.borderRight = "1px solid rgba(0, 0, 0, 0)"
            box1.style.borderBottom = "1px solid rgba(0, 0, 0, 0)"

            box2.style.display = ""
            box2.style.left = ((posX / 2) + 11) + "px"
            box2.style.top = "5px"
            box2.style.width = "1px"
            box2.style.height = (posY - 1) + "px"
            box2.style.borderLeft = "1px solid rgba(0, 0, 0, 1)"
            box2.style.borderTop = "1px solid rgba(0, 0, 0, 0)"
            box2.style.borderRight = "1px solid rgba(0, 0, 0, 0)"
            box2.style.borderBottom = "1px solid rgba(0, 0, 0, 0)"

            box3.style.display = ""
            box3.style.left = box2.style.left
            box3.style.top = (posY + 5) + "px"
            box3.style.width = (posX / 2) + "px"
            box3.style.height = "1px"
            box3.style.borderLeft = "1px solid rgba(0, 0, 0, 0)"
            box3.style.borderTop = "1px solid rgba(0, 0, 0, 1)"
            box3.style.borderRight = "1px solid rgba(0, 0, 0, 0)"
            box3.style.borderBottom = "1px solid rgba(0, 0, 0, 0)"

            box4.style.display = "none"
            box5.style.display = "none"    
        } else if ((posX <= 5) && (posY < 0)) {
            // top left

            box1.style.display = ""
            box1.style.left = "10px"
            box1.style.top = "5px"
            box1.style.width = "20px"
            box1.style.height = "1px"
            box1.style.borderLeft = "1px solid rgba(0, 0, 0, 0)"
            box1.style.borderTop = "1px solid rgba(0, 0, 0, 1)"
            box1.style.borderRight = "1px solid rgba(0, 0, 0, 0)"
            box1.style.borderBottom = "1px solid rgba(0, 0, 0, 0)"

            box2.style.display = ""
            box2.style.left = "32px"
            box2.style.top = (posY / 2) + "px"
            box2.style.width = "1px"
            box2.style.height = ((-(posY / 2)) + 4) + "px"
            box2.style.borderLeft = "1px solid rgba(0, 0, 0, 1)"
            box2.style.borderTop = "1px solid rgba(0, 0, 0, 0)"
            box2.style.borderRight = "1px solid rgba(0, 0, 0, 0)"
            box2.style.borderBottom = "1px solid rgba(0, 0, 0, 0)"

            box3.style.display = ""
            box3.style.left = (posX + 10 - 20) + "px"
            box3.style.top = (posY / 2) + "px"
            box3.style.width = (-posX + 40) + "px"
            box3.style.height = "1px"
            box3.style.borderLeft = "1px solid rgba(0, 0, 0, 0)"
            box3.style.borderTop = "1px solid rgba(0, 0, 0, 1)"
            box3.style.borderRight = "1px solid rgba(0, 0, 0, 0)"
            box3.style.borderBottom = "1px solid rgba(0, 0, 0, 0)"

            box4.style.display = ""
            box4.style.left = (posX + 10 - 20) + "px"
            box4.style.top = (posY + 4) + "px"
            box4.style.width = "20px"
            box4.style.height = (-(posY / 2) - 5) + "px"
            box4.style.borderLeft = "1px solid rgba(0, 0, 0, 1)"
            box4.style.borderTop = "1px solid rgba(0, 0, 0, 0)"
            box4.style.borderRight = "1px solid rgba(0, 0, 0, 0)"
            box4.style.borderBottom = "1px solid rgba(0, 0, 0, 0)"

            box5.style.display = ""
            box5.style.left = box4.style.left
            box5.style.top = box4.style.top
            box5.style.width = "20px"
            box5.style.height = "1px"
            box5.style.borderLeft = "1px solid rgba(0, 0, 0, 0)"
            box5.style.borderTop = "1px solid rgba(0, 0, 0, 1)"
            box5.style.borderRight = "1px solid rgba(0, 0, 0, 0)"
            box5.style.borderBottom = "1px solid rgba(0, 0, 0, 0)"
        } else if ((posX <= 5) && (posY > 0)) {
            // bottom left

            box1.style.display = ""
            box1.style.left = "10px"
            box1.style.top = "5px"
            box1.style.width = "20px"
            box1.style.height = "1px"
            box1.style.borderLeft = "1px solid rgba(0, 0, 0, 0)"
            box1.style.borderTop = "1px solid rgba(0, 0, 0, 1)"
            box1.style.borderRight = "1px solid rgba(0, 0, 0, 0)"
            box1.style.borderBottom = "1px solid rgba(0, 0, 0, 0)"

            box2.style.display = ""
            box2.style.left = "32px"
            box2.style.top = box1.style.top
            box2.style.width = "1px"
            box2.style.height = (posY / 2) + "px"
            box2.style.borderLeft = "1px solid rgba(0, 0, 0, 1)"
            box2.style.borderTop = "1px solid rgba(0, 0, 0, 0)"
            box2.style.borderRight = "1px solid rgba(0, 0, 0, 0)"
            box2.style.borderBottom = "1px solid rgba(0, 0, 0, 0)"

            box3.style.display = ""    
            box3.style.left = (posX + 10 - 20) + "px"
            box3.style.top = ((posY / 2) + 6) + "px"
            box3.style.width = (-posX + 40) + "px"
            box3.style.height = "1px"
            box3.style.borderLeft = "1px solid rgba(0, 0, 0, 0)"
            box3.style.borderTop = "1px solid rgba(0, 0, 0, 1)"
            box3.style.borderRight = "1px solid rgba(0, 0, 0, 0)"
            box3.style.borderBottom = "1px solid rgba(0, 0, 0, 0)"

            box4.style.display = ""
            box4.style.left = box3.style.left
            box4.style.top = box3.style.top
            box4.style.width = "1px"
            box4.style.height = ((posY / 2) - 2) + "px"
            box4.style.borderLeft = "1px solid rgba(0, 0, 0, 1)"
            box4.style.borderTop = "1px solid rgba(0, 0, 0, 0)"
            box4.style.borderRight = "1px solid rgba(0, 0, 0, 0)"
            box4.style.borderBottom = "1px solid rgba(0, 0, 0, 0)"

            box5.style.display = ""
            box5.style.left = box4.style.left
            box5.style.top = (posY + 5) + "px"
            box5.style.width = "20px"
            box5.style.height = "1px"
            box5.style.borderLeft = "1px solid rgba(0, 0, 0, 0)"
            box5.style.borderTop = "1px solid rgba(0, 0, 0, 1)"
            box5.style.borderRight = "1px solid rgba(0, 0, 0, 0)"
            box5.style.borderBottom = "1px solid rgba(0, 0, 0, 0)"
        }
    }

    makeHTMLText(text) {

        var result = "" + text

        result = result.replaceAll("\r\n", "<br>")
        result = result.replaceAll("\r", "<br>")
        result = result.replaceAll("\n", "<br>")

        return result
    }

    escapeStr(str) {

        if (str == undefined) 
            str = ""

        return str
            .replace(/[\\]/g, '\\\\')
            .replace(/[\"]/g, '\\\"')
            .replace(/[\/]/g, '\\/')
            .replace(/[\b]/g, '\\b')
            .replace(/[\f]/g, '\\f')
            .replace(/[\n]/g, '\\n')
            .replace(/[\r]/g, '\\r')
            .replace(/[\t]/g, '\\t');
    }

    canReceiveFlow() {

        return true
    }

    getScript() {

        var ret = `{
                "type" : "` + this.getType() + `",
                "id" : "` + this.id + `",
                "left" : ` + this.frame.offsetLeft + `,
                "top" : ` + this.frame.offsetTop + `,
                "data" : ` + this.getDetailScript() +`
            }`

        return ret
    }

    getDetailScript() {

        return `""`
    }

    getPointTargetId(idx) {

        var ret = ""
        var point = this.outPointList[idx]
        
        if (point != undefined) {

            if (point.targetId != undefined) {

                ret = point.targetId
            } 
        }
        
        return ret
    }
}

class FlowStart extends FlowBaseComponent {

    constructor(fb, x, y) {

        super(fb, x, y)

        this.id = "START"
        this.addOutPoint(this.frame)
    }

    getType() {
        return "FlowStart"
    }

    getTitle() {

        return "Start"
    }

    canReceiveFlow() {

        return false
    }

    select() {
    }

    getDetailScript() {

        return `{
                    "next" : "` + this.getPointTargetId(0) + `"
                }`
    }

    loadDetailData(data) {

        this.outPointList[0].targetId = data["next"]
    }
}

class FlowEnd extends FlowBaseComponent {

    constructor(fb, x, y) {

        super(fb, x, y)

        this.id = "END"
    }

    getType() {
        return "FlowEnd"
    }

    getTitle() {

        return "End"
    }

    select() {
    }
}

class FlowSendMsg extends FlowBaseComponent {

    constructor(fb, x, y) {

        super(fb, x, y)

        this.to = "Customer"
        this.msg = "Hello!"

        this.lblTo = document.createElement("DIV")
        this.lblTo.style = `
                            position: relative;
                            width: 100%;
                            padding-right: 10px;
                            margin-top: 10px;
                            font-family: Helvetica, Arial, Sans-Serif;
                            font-size: 13px;
                            user-select: none; 
        `

        this.lblTo.innerHTML = "<b>To : </b>" + this.makeHTMLText(this.to)
        this.frame.appendChild(this.lblTo)

        this.lblMsg = document.createElement("DIV")
        this.lblMsg.style = `
                            position: relative;
                            width: 100%;
                            padding-right: 20px;
                            margin-top: 10px;
                            font-family: Helvetica, Arial, Sans-Serif;
                            font-size: 13px;
                            user-select: none; 
        `

        this.lblMsg.innerHTML = this.makeHTMLText(this.msg)
        this.frame.appendChild(this.lblMsg)

        this.addOutPoint(this.frame)
    }

    getType() {
        return "FlowSendMsg"
    }

    getDetailScript() {

        return `{
                    "next" : "` + this.getPointTargetId(0) + `",
                    "to" : "` + this.escapeStr(this.to) + `",
                    "msg" : "` + this.escapeStr(this.msg) + `"
                }`

        return ret
    }

    loadDetailData(data) {

        this.outPointList[0].targetId = data["next"]

        this.setTo(data["to"])
        this.setMsg(data["msg"])
    }

    getTitle() {

        return "Send Msg"
    }

    getTo() {
        return this.to
    }

    setTo(to) {
        this.to = to
        this.lblTo.innerHTML = "<b>To : </b>" + this.makeHTMLText(this.to)
    }

    getMsg() {
        return this.msg
    }

    setMsg(msg) {

        this.msg = msg
        this.lblMsg.innerHTML = this.makeHTMLText(this.msg)
    }
}

class FlowHttpCall extends FlowBaseComponent {

    constructor(fb, x, y) {

        super(fb, x, y)

        this.method = "POST"
        this.url = "https://www.server.com/api"
        this.bodyType = "JSON"
        this.body = `{
    "data" : "Hello"
}`

        this.lblMethod = document.createElement("DIV")
        this.lblMethod.style = `
                            position: relative;
                            width: 100%;
                            padding-right: 10px;
                            margin-top: 10px;
                            font-family: Helvetica, Arial, Sans-Serif;
                            font-size: 13px;
                            user-select: none; 
        `

        this.lblMethod.innerHTML = "<b>Method : </b>" + this.makeHTMLText(this.method)
        this.frame.appendChild(this.lblMethod)

        this.lblUrl = document.createElement("DIV")
        this.lblUrl.style = `
                            position: relative;
                            width: 100%;
                            padding-right: 20px;
                            margin-top: 10px;
                            font-family: Helvetica, Arial, Sans-Serif;
                            font-size: 13px;
                            user-select: none; 
        `

        this.lblUrl.innerHTML =  "<b>URL : </b>" + this.makeHTMLText(this.url)
        this.frame.appendChild(this.lblUrl)

        this.lblBodyType = document.createElement("DIV")
        this.lblBodyType.style = `
                            position: relative;
                            width: 100%;
                            padding-right: 20px;
                            margin-top: 10px;
                            font-family: Helvetica, Arial, Sans-Serif;
                            font-size: 13px;
                            user-select: none; 
        `

        this.lblBodyType.innerHTML =  "<b>Format : </b>" + this.makeHTMLText(this.bodyType)
        this.frame.appendChild(this.lblBodyType)

        this.lblBody = document.createElement("DIV")
        this.lblBody.style = `
                            position: relative;
                            width: 100%;
                            padding-right: 20px;
                            margin-top: 10px;
                            font-family: Helvetica, Arial, Sans-Serif;
                            font-size: 13px;
                            user-select: none; 
        `

        this.lblBody.innerHTML = "<pre>" + this.body + "</pre>" 
        this.frame.appendChild(this.lblBody)

        this.addOutPoint(this.frame)
    }

    getType() {
        return "FlowHttpCall"
    }

    getDetailScript() {

        return `{
                    "next" : "` + this.getPointTargetId(0) + `",
                    "method" : "` + this.method + `",
                    "url" : "` + this.escapeStr(this.url) + `",
                    "bodyType" : "` + this.bodyType + `",
                    "body" : "` + this.escapeStr(this.body) + `"
                }`

        return ret
    }

    loadDetailData(data) {

        this.outPointList[0].targetId = data["next"]

        this.setMethod(data["method"])
        this.setUrl(data["url"])
        this.setBody(data["body"])
        this.setBodyType(data["bodyType"])
    }

    getTitle() {

        return "HTTP Call"
    }

    getMethod() {
        return this.method
    }

    setMethod(method) {
        this.method = method
        this.lblMethod.innerHTML = "<b>Method : </b>" + this.makeHTMLText(this.method)
    }

    getUrl() {
        return this.url
    }

    setUrl(url) {

        this.url = url
        this.lblUrl.innerHTML = "<b>URL : </b>" + this.makeHTMLText(this.url)
    }

    getBody() {
        return this.body
    }

    setBody(body) {

        this.body = body
        this.lblBody.innerHTML = "<pre>" + this.body + "</pre>"
    }

    getBodyType() {
        return this.bodyType
    }

    setBodyType(bodyType) {

        this.bodyType = bodyType
        this.lblBodyType.innerHTML = "<b>Format : </b>" +  this.makeHTMLText(this.bodyType)
    }
}

class FlowWaitResponse extends FlowBaseComponent {

    constructor(fb, x, y) {

        super(fb, x, y)

        this.variable = "response"
        this.duration = "2"

        this.lblTo = document.createElement("DIV")
        this.lblTo.style = `
                            position: relative;
                            width: 100%;
                            padding-right: 10px;
                            margin-top: 10px;
                            font-family: Helvetica, Arial, Sans-Serif;
                            font-size: 13px;
                            user-select: none; 
        `

        this.lblTo.innerHTML = "<b>Var : </b>" + this.makeHTMLText(this.variable)
        this.frame.appendChild(this.lblTo)

        this.lblDur = document.createElement("DIV")
        this.lblDur.style = `
                            position: relative;
                            width: 100%;
                            padding-right: 10px;
                            margin-top: 10px;
                            font-family: Helvetica, Arial, Sans-Serif;
                            font-size: 13px;
                            user-select: none; 
        `

        this.lblDur.innerHTML = "<b>Duration : </b>" + this.makeHTMLText(this.duration) + " Minutes"
        this.frame.appendChild(this.lblDur)

        this.addOutPoint(this.frame)
    }

    getType() {
        return "FlowWaitResponse"
    }

    getTitle() {

        return "Wait Response"
    }

    getDetailScript() {

        return `{
                    "next" : "` + this.getPointTargetId(0) + `",
                    "variable" : "` + this.escapeStr(this.variable) + `",
                    "duration" : ` + this.duration + `
                }`
    }

    loadDetailData(data) {

        this.outPointList[0].targetId = data["next"]

        this.setVariable(data["variable"])
        this.setDuration(data["duration"])
    }

    getVariable() {
        return this.variable
    }

    setVariable(variable) {
        this.variable = variable
        this.lblTo.innerHTML = "<b>Var: </b>" + this.makeHTMLText(this.variable)
    }

    getDuration() {
        return this.duration
    }

    setDuration(duration) {
        this.duration = duration
        this.lblDur.innerHTML = "<b>Dur: </b>" + this.makeHTMLText(this.duration) + " Minutes"
    }
}

class FlowValidation extends FlowBaseComponent {

    constructor(fb, x, y) {

        super(fb, x, y)

        this.to = "Validation"
        this.pattern = "PhoneNo"
        this.variable = "response"
        this.customPattern = ""

        this.lblTo = document.createElement("DIV")
        this.lblTo.style = `
                            position: relative;
                            width: 100%;
                            padding-right: 10px;
                            margin-top: 10px;
                            font-family: Helvetica, Arial, Sans-Serif;
                            font-size: 13px;
                            user-select: none; 
        `

        this.lblTo.innerHTML = "<b>Var : </b>" + this.makeHTMLText(this.variable)
        this.frame.appendChild(this.lblTo)

        this.lblPattern = document.createElement("DIV")
        this.lblPattern.style = `
                            position: relative;
                            width: 100%;
                            padding-right: 10px;
                            margin-top: 10px;
                            font-family: Helvetica, Arial, Sans-Serif;
                            font-size: 13px;
                            user-select: none; 
        `

        this.lblPattern.innerHTML = "<b>Ptrn : </b>" + this.makeHTMLText(this.pattern)
        this.frame.appendChild(this.lblPattern)

        this.lblButtons = document.createElement("DIV")
        this.lblButtons.style = `
                            position: relative;
                            width: 100%;
                            padding-right: 20px;
                            margin-top: 10px;
                            font-family: Helvetica, Arial, Sans-Serif;
                            font-size: 13px;
                            user-select: none; 
        `

        this.frame.appendChild(this.lblButtons)

        this.btnValid = document.createElement("DIV")
        this.btnValid.style = `
                            position: relative;
                            width: 100%;
                            padding: 8px;
                            font-family: Helvetica, Arial, Sans-Serif;
                            font-size: 13px;
                            user-select: none; 
                            background: #6B6FAC;
                            border-radius: 4px; 
                            box-shadow: 0px 1px 2px #AAAAAA;
                            width: calc(100% - 16px);
                            margin-bottom: 5px;
                            color: #FFFFFF;
        `

        this.btnValid.innerHTML = this.makeHTMLText("Valid")
        this.lblButtons.appendChild(this.btnValid)

        this.addOutPoint(this.btnValid)

        this.btnInvalid = document.createElement("DIV")
        this.btnInvalid.style = `
                            position: relative;
                            width: 100%;
                            padding: 8px;
                            font-family: Helvetica, Arial, Sans-Serif;
                            font-size: 13px;
                            user-select: none; 
                            background: #D63A7B;
                            border-radius: 4px; 
                            box-shadow: 0px 1px 2px #AAAAAA;
                            width: calc(100% - 16px);
                            margin-bottom: 5px;
                            color: #FFFFFF;
        `

        this.btnInvalid.innerHTML = this.makeHTMLText("Invalid")
        this.lblButtons.appendChild(this.btnInvalid)

        this.addOutPoint(this.btnInvalid)
    }

    getType() {
        return "FlowValidation"
    }

    getTitle() {

        return "Pattern Validation"
    }

    getDetailScript() {

        return `{
                    "validNext" : "` + this.getPointTargetId(0) + `",
                    "invalidNext" : "` + this.getPointTargetId(1) + `",
                    "variable" : "` + this.escapeStr(this.variable) + `",
                    "pattern" : "` + this.pattern + `",
                    "customPattern" : "` + this.escapeStr(this.customPattern) + `"
                }`
    }

    loadDetailData(data) {

        this.outPointList[0].targetId = data["validNext"]
        this.outPointList[1].targetId = data["invalidNext"]

        this.setVariable(data["variable"])
        this.setPattern(data["pattern"])
        this.setCustomPattern(data["customPattern"])
    }

    getVariable() {
        return this.variable
    }

    setVariable(variable) {
        this.variable = variable
        this.lblTo.innerHTML = "<b>Var : </b>" + this.makeHTMLText(this.variable)
    }

    getPattern() {
        return this.pattern
    }

    setPattern(pattern) {

        this.pattern = pattern

        var html = "<b>Ptrn : </b>" + this.makeHTMLText(this.pattern)

        if (this.pattern == "Custom") {

            html += " (" + this.customPattern + ")"
        }

        this.lblPattern.innerHTML = html
    }

    getCustomPattern() {
        return this.pattern
    }

    setCustomPattern(pattern) {

        this.customPattern = pattern
        this.setPattern(this.pattern)
    }
}

class FlowSendButton extends FlowBaseComponent {

    constructor(fb, x, y) {

        super(fb, x, y)

        this.to = "Customer"
        this.msg = "Hello!"
        this.variable = "response"
        this.buttons = []

        this.lblTo = document.createElement("DIV")
        this.lblTo.style = `
                            position: relative;
                            width: 100%;
                            padding-right: 10px;
                            margin-top: 10px;
                            font-family: Helvetica, Arial, Sans-Serif;
                            font-size: 13px;
                            user-select: none; 
        `

        this.lblTo.innerHTML = "<b>To : </b>" + this.makeHTMLText(this.to)
        this.frame.appendChild(this.lblTo)

        this.lblVar = document.createElement("DIV")
        this.lblVar.style = `
                            position: relative;
                            width: 100%;
                            padding-right: 10px;
                            margin-top: 10px;
                            font-family: Helvetica, Arial, Sans-Serif;
                            font-size: 13px;
                            user-select: none; 
        `

        this.lblVar.innerHTML = "<b>Var : </b>" + this.makeHTMLText(this.variable)
        this.frame.appendChild(this.lblVar)

        this.lblMsg = document.createElement("DIV")
        this.lblMsg.style = `
                            position: relative;
                            width: 100%;
                            padding-right: 20px;
                            margin-top: 10px;
                            font-family: Helvetica, Arial, Sans-Serif;
                            font-size: 13px;
                            user-select: none; 
        `

        this.lblMsg.innerHTML = this.makeHTMLText(this.msg)
        this.frame.appendChild(this.lblMsg)

        this.lblButtons = document.createElement("DIV")
        this.lblButtons.style = `
                            position: relative;
                            width: 100%;
                            padding-right: 20px;
                            margin-top: 10px;
                            font-family: Helvetica, Arial, Sans-Serif;
                            font-size: 13px;
                            user-select: none; 
        `

        this.frame.appendChild(this.lblButtons)

        this.setButtons(["Opt 1"])
    }

    getType() {
        return "FlowSendButton"
    }

    getTitle() {

        return "Send Button"
    }

    getDetailScript() {

        var btnString = ""

        for (var i in this.buttons) {

            var idx = parseInt(i)

            btnString += `,{
                            "title" : "` + this.escapeStr(this.buttons[i]) + `",
                            "next" : "` + this.getPointTargetId(idx) + `"
                        }`
        }

        if (btnString != "") {

            btnString = btnString.substr(1)
        }

        return `{
                    "to" : "` + this.to + `",
                    "variable" : "` + this.escapeStr(this.variable) + `",
                    "msg" : "` + this.msg + `",
                    "buttons" : [
                        ` + btnString + `
                    ],
                    "defaultNext" : "` + this.getPointTargetId(this.buttons.length) + `"
                }`
    }
    
    loadDetailData(data) {

        var buttons = []
        
        for (var i in data["buttons"]) {

            buttons.push(data["buttons"][parseInt(i)]["title"])
        }

        this.setButtons(buttons)
        
        for (var i in data["buttons"]) {

            this.outPointList[parseInt(i)].targetId = data["buttons"][parseInt(i)]["next"]
        }

        this.setTo(data["to"])
        this.setMsg(data["msg"])
        this.setVariable(data["variable"])
        
        this.outPointList[this.buttons.length].targetId = data["defaultNext"]
    }

    getTo() {
        return this.to
    }

    setTo(to) {
        this.to = to
        this.lblTo.innerHTML = "<b>To : </b>" + this.makeHTMLText(this.to)
    }

    getVariable() {
        return this.variable
    }

    setVariable(variable) {
        this.variable = variable
        this.lblVar.innerHTML = "<b>Var: </b>" + this.makeHTMLText(this.variable)
    }

    getMsg() {
        return this.msg
    }

    setMsg(msg) {

        this.msg = msg
        this.lblMsg.innerHTML = this.makeHTMLText(this.msg)
    }

    getButtons() {
        return this.buttons
    }

    setButtons(buttons) {

        this.buttons = buttons

        this.lblButtons.innerHTML = ""
        
        var defaultNext = undefined 

        var oldNext = []

        if (this.outPointList.length > 0) {

            for (var i = 0; i < (this.outPointList.length - 1); i++) {
    
                oldNext.push(this.outPointList[i].targetId)
            }
    
            defaultNext = this.outPointList[this.outPointList.length - 1].targetId
        }

        this.outPointList = []

        for (var i in this.buttons) {

            var btn = document.createElement("DIV")
            btn.style = `
                                position: relative;
                                width: 100%;
                                padding: 8px;
                                font-family: Helvetica, Arial, Sans-Serif;
                                font-size: 13px;
                                user-select: none; 
                                background: #6B6FAC;
                                border-radius: 4px; 
                                box-shadow: 0px 1px 2px #AAAAAA;
                                width: calc(100% - 16px);
                                margin-bottom: 5px;
                                color: #FFFFFF;
            `

            btn.innerHTML = this.makeHTMLText(this.buttons[i])
            this.lblButtons.appendChild(btn)

            this.addOutPoint(btn)
            
            if (i < oldNext.length) {

                this.outPointList[i].targetId = oldNext[i]
            }
        }

        var btn = document.createElement("DIV")
        btn.style = `
                            position: relative;
                            width: 100%;
                            padding: 8px;
                            font-family: Helvetica, Arial, Sans-Serif;
                            font-size: 13px;
                            user-select: none; 
                            background: #D63A7B;
                            border-radius: 4px; 
                            box-shadow: 0px 1px 2px #AAAAAA;
                            width: calc(100% - 16px);
                            margin-bottom: 5px;
                            color: #FFFFFF;
        `

        btn.innerHTML = this.makeHTMLText("Default")
        this.lblButtons.appendChild(btn)

        this.addOutPoint(btn)

        this.outPointList[this.outPointList.length - 1].targetId = defaultNext

        this.updateLink(undefined)
    }
}

class FlowSendList extends FlowBaseComponent {

    constructor(fb, x, y) {

        super(fb, x, y)

        this.to = "Customer"
        this.msg = "Hello!"
        this.listTitle = "List"
        this.variable = "response"
        this.list = []

        this.lblTo = document.createElement("DIV")
        this.lblTo.style = `
                            position: relative;
                            width: 100%;
                            padding-right: 10px;
                            margin-top: 10px;
                            font-family: Helvetica, Arial, Sans-Serif;
                            font-size: 13px;
                            user-select: none; 
        `

        this.lblTo.innerHTML = "<b>To : </b>" + this.makeHTMLText(this.to)
        this.frame.appendChild(this.lblTo)

        this.lblVar = document.createElement("DIV")
        this.lblVar.style = `
                            position: relative;
                            width: 100%;
                            padding-right: 10px;
                            margin-top: 10px;
                            font-family: Helvetica, Arial, Sans-Serif;
                            font-size: 13px;
                            user-select: none; 
        `

        this.lblVar.innerHTML = "<b>Var : </b>" + this.makeHTMLText(this.variable)
        this.frame.appendChild(this.lblVar)

        this.lblMsg = document.createElement("DIV")
        this.lblMsg.style = `
                            position: relative;
                            width: 100%;
                            padding-right: 20px;
                            margin-top: 10px;
                            font-family: Helvetica, Arial, Sans-Serif;
                            font-size: 13px;
                            user-select: none; 
        `

        this.lblMsg.innerHTML = this.makeHTMLText(this.msg)
        this.frame.appendChild(this.lblMsg)

        this.lblTitle = document.createElement("DIV")
        this.lblTitle.style = `
                            position: relative;
                            width: 100%;
                            padding-right: 10px;
                            margin-top: 10px;
                            font-family: Helvetica, Arial, Sans-Serif;
                            font-size: 13px;
                            user-select: none; 
        `

        this.lblTitle.innerHTML = "<b>List Title : </b>" + this.makeHTMLText(this.listTitle)
        this.frame.appendChild(this.lblTitle)

        this.lblButtons = document.createElement("DIV")
        this.lblButtons.style = `
                            position: relative;
                            width: 100%;
                            padding-right: 20px;
                            margin-top: 10px;
                            font-family: Helvetica, Arial, Sans-Serif;
                            font-size: 13px;
                            user-select: none; 
        `

        this.frame.appendChild(this.lblButtons)
        
        this.setList(["Opt 1"])
    }

    getType() {
        return "FlowSendList"
    }

    getTitle() {

        return "Send List"
    }

    getDetailScript() {

        var btnString = ""

        for (var i in this.list) {

            var idx = parseInt(i)

            btnString += `,{
                            "title" : "` + this.escapeStr(this.list[i]) + `",
                            "next" : "` + this.getPointTargetId(idx) + `"
                        }`
        }

        if (btnString != "") {

            btnString = btnString.substr(1)
        }

        return `{
                    "to" : "` + this.to + `",
                    "msg" : "` + this.msg + `",
                    "variable" : "` + this.escapeStr(this.variable) + `",
                    "listTitle" : "` + this.listTitle + `",
                    "list" : [
                        ` + btnString + `
                    ],
                    "defaultNext" : "` + this.getPointTargetId(this.list.length) + `"
                }`
    }

    loadDetailData(data) {

        var buttons = []
        
        for (var i in data["list"]) {

            buttons.push(data["list"][parseInt(i)]["title"])
        }

        this.setList(buttons)
        
        for (var i in data["list"]) {

            this.outPointList[parseInt(i)].targetId = data["list"][parseInt(i)]["next"]
        }

        this.setTo(data["to"])
        this.setMsg(data["msg"])
        this.setListTitle(data["listTitle"])
        this.setVariable(data["variable"])

        this.outPointList[this.list.length].targetId = data["defaultNext"]
    }

    getTo() {
        return this.to
    }

    setTo(to) {
        this.to = to
        this.lblTo.innerHTML = "<b>To : </b>" + this.makeHTMLText(this.to)
    }

    getMsg() {
        return this.msg
    }

    setMsg(msg) {

        this.msg = msg
        this.lblMsg.innerHTML = this.makeHTMLText(this.msg)
    }

    getVariable() {
        return this.variable
    }

    setVariable(variable) {
        this.variable = variable
        this.lblVar.innerHTML = "<b>Var: </b>" + this.makeHTMLText(this.variable)
    }

    getListTitle() {
        return this.listTitle
    }

    setListTitle(listTitle) {

        this.listTitle = listTitle
        this.lblTitle.innerHTML = "<b>List Title : </b>" + this.makeHTMLText(this.listTitle)
    }

    getList() {
        return this.list
    }

    setList(list) {

        this.list = list

        this.lblButtons.innerHTML = ""

        var defaultNext = undefined 

        var oldNext = []

        if (this.outPointList.length > 0) {

            for (var i = 0; i < (this.outPointList.length - 1); i++) {
    
                oldNext.push(this.outPointList[i].targetId)
            }
    
            defaultNext = this.outPointList[this.outPointList.length - 1].targetId
        }

        this.outPointList = []

        for (var i in this.list) {

            var btn = document.createElement("DIV")
            btn.style = `
                                position: relative;
                                width: 100%;
                                padding: 8px;
                                font-family: Helvetica, Arial, Sans-Serif;
                                font-size: 13px;
                                user-select: none; 
                                background: #6B6FAC;
                                border-radius: 4px; 
                                box-shadow: 0px 1px 2px #AAAAAA;
                                width: calc(100% - 16px);
                                margin-bottom: 5px;
                                color: #FFFFFF;
            `

            btn.innerHTML = this.makeHTMLText(this.list[i])
            this.lblButtons.appendChild(btn)

            this.addOutPoint(btn)

            if (i < oldNext.length) {

                this.outPointList[i].targetId = oldNext[i]
            }
        }

        var btn = document.createElement("DIV")
        btn.style = `
                            position: relative;
                            width: 100%;
                            padding: 8px;
                            font-family: Helvetica, Arial, Sans-Serif;
                            font-size: 13px;
                            user-select: none; 
                            background: #D63A7B;
                            border-radius: 4px; 
                            box-shadow: 0px 1px 2px #AAAAAA;
                            width: calc(100% - 16px);
                            margin-bottom: 5px;
                            color: #FFFFFF;
        `

        btn.innerHTML = this.makeHTMLText("Default")
        this.lblButtons.appendChild(btn)

        this.addOutPoint(btn)

        this.outPointList[this.outPointList.length - 1].targetId = defaultNext

        this.updateLink(undefined)
    }
}

class FlowBranch extends FlowBaseComponent {

    constructor(fb, x, y) {

        super(fb, x, y)

        this.buttons = []

        this.lblButtons = document.createElement("DIV")
        this.lblButtons.style = `
                            position: relative;
                            width: 100%;
                            padding-right: 20px;
                            margin-top: 10px;
                            font-family: Helvetica, Arial, Sans-Serif;
                            font-size: 13px;
                            user-select: none; 
        `

        this.frame.appendChild(this.lblButtons)

        this.setConditions(["response == \"Yes\""])
    }

    getType() {
        return "FlowBranch"
    }

    getTitle() {

        return "Branch"
    }

    getDetailScript() {

        var btnString = ""

        for (var i in this.buttons) {

            var idx = parseInt(i)

            btnString += `,{
                            "condition" : "` + this.escapeStr(this.buttons[i]) + `",
                            "next" : "` + this.getPointTargetId(idx) + `"
                        }`
        }

        if (btnString != "") {

            btnString = btnString.substr(1)
        }

        return `{
                    "conditions" : [
                        ` + btnString + `
                    ],
                    "defaultNext" : "` + this.getPointTargetId(this.buttons.length) + `"
                }`
    }
    
    loadDetailData(data) {

        var buttons = []
        
        for (var i in data["conditions"]) {

            buttons.push(data["conditions"][parseInt(i)]["condition"])
        }

        this.setConditions(buttons)
        
        for (var i in data["conditions"]) {

            this.outPointList[parseInt(i)].targetId = data["conditions"][parseInt(i)]["next"]
        }

        this.outPointList[this.buttons.length].targetId = data["defaultNext"]
    }

    getConditions() {
        return this.buttons
    }

    setConditions(buttons) {

        this.buttons = buttons

        this.lblButtons.innerHTML = ""

        var defaultNext = undefined 

        var oldNext = []

        if (this.outPointList.length > 0) {

            for (var i = 0; i < (this.outPointList.length - 1); i++) {
    
                oldNext.push(this.outPointList[i].targetId)
            }
    
            defaultNext = this.outPointList[this.outPointList.length - 1].targetId
        }

        this.outPointList = []

        for (var i in this.buttons) {

            var btn = document.createElement("DIV")
            btn.style = `
                                position: relative;
                                width: 100%;
                                padding: 8px;
                                font-family: Helvetica, Arial, Sans-Serif;
                                font-size: 13px;
                                user-select: none; 
                                background: #6B6FAC;
                                border-radius: 4px; 
                                box-shadow: 0px 1px 2px #AAAAAA;
                                width: calc(100% - 16px);
                                margin-bottom: 5px;
                                color: #FFFFFF;
            `

            btn.innerHTML = this.makeHTMLText(this.buttons[i])
            this.lblButtons.appendChild(btn)

            this.addOutPoint(btn)

            if (i < oldNext.length) {

                this.outPointList[i].targetId = oldNext[i]
            }
        }

        var btn = document.createElement("DIV")
        btn.style = `
                            position: relative;
                            width: 100%;
                            padding: 8px;
                            font-family: Helvetica, Arial, Sans-Serif;
                            font-size: 13px;
                            user-select: none; 
                            background: #D63A7B;
                            border-radius: 4px; 
                            box-shadow: 0px 1px 2px #AAAAAA;
                            width: calc(100% - 16px);
                            margin-bottom: 5px;
                            color: #FFFFFF;
        `

        btn.innerHTML = this.makeHTMLText("Default")
        this.lblButtons.appendChild(btn)

        this.addOutPoint(btn)

        this.outPointList[this.outPointList.length - 1].targetId = defaultNext

        this.updateLink(undefined)
    }
}

class FlowSendEmail extends FlowBaseComponent {

    constructor(fb, x, y) {

        super(fb, x, y)

        this.addOutPoint(this.frame)
    }

    getType() {
        return "FlowSendEmail"
    }

    getTitle() {

        return "Send Email"
    }
}


var flowAsset = new Map()

flowAsset["close"] = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAHvMAAB7zAWerpoQAAAdKSURBVFhHxZhJaFZXFMefmb/Mg+mQRUrbmEUh2FpsqZE4VNLSFIpQShGVFtx1E4NKNtKFoMUEXJRSBAticNXSRRfGilCwA8UsaqUSUxLrGC1oImYeX3//m3efb8xgC/3D+e587v+ec+7wvVXOk8OOjaYWbkq6IqyUYJBMViC1edsuMpJ5T2x+xWStwqVgJ5dkByRHkpWVpTRr1apVIuq4rmuIgVlSK3MBsQtYkuhyCKqPJraEciGUn52dXUBaQJpPXQYyqyFWSH6WuoeQHaE8PTc3N0XbJOkk6RTtM+qDiGjQqolYjKC1mMjlMGF+Tk6OCBVBrHRmZqaRSd+ExFqkVn0QH/QfQnrp+2t+fv55qu7SfwQZm52dnWSMyIqoJZlINI2gJSer5UIqk5ubW8xkVVNTUx9iiZ1M8Kw6LhMz6DgP0ZPo6IPgQxY4CtkJtSFBt4cgAlEEyeVDrCgvL68CZU2Q+wJyLdSXICtBNgtaA6n3GJ8pKCgYgKixHGWRSnV1EkEbb5acrLaHVR+mrkod/gWyIfQKRNdhzd8hKTfPUWc2FRKzYtTF1nJ5cqnITU5OtmG9PaY1AiZwNm7c6GzatMmpr693ysrKnOnpaefWrVtOT0+Pc/bsWWdoaMjrHQbxeb2oqKgVy/7JmAdyOdXTiHV3DJacNkJVYWHhGtIOynZVvkDcbW1tdW/cuIH+dLA499SpU25dXV1Mh0TxWFpa2uzNJe8UIOIQNZyBXJuHlBIjz0HiI/IK4JDShoYG98qVKx6F5WFiYsLdu3evi9VCuiQQ68byb2hOyqWIOJjzNAhrvUKOkqdZ0TqUXaMcUrZlyxb30aNH3rQrx/HjxxNJZjKZdty9VnNT1lkas6IKYl7GSl5gVUfJh5TIciJ3//59d9euXe6GDRvckydPelMno7+/392+fbtLjLrd3d2m7siRIyG9Elx9rby8fIvmplyGiEuIoEyagdhTWO9lVjlI2VegmLNu3b17d0h5R0eHqY/i6tWrbk1Njd8PK5nF6VjZtm1bSIcEcp/KiuJAOYP4bhZT3QLF7Nxa5BPyocHaEBayXLQ9SjJKzsrly5dNuxaL1UJtEPuFWNwoDpSLEXEyVtRPLlLO2VTPwG/J+wOlKLhb5dZguxVLMo1cY2Ojy3Fl+ggtLS3RPpO4+V1xIF+OiJMhKFPqwl+Nextw7wB5f2BTU5On8jFEJtjHyv79+xPJrV+/3h0eHvZGL+D06dOxfsx/QBzIr0bEybjZxB+WeobG18iHjpaDBw96KsNIIxmVJHLC7du3Y32x3pfE4aviQtmPQ3O8EAM1BOo75EODurq6PJVxLEUyjZwFZEL92YxfFxcXvy4ulM1xY3eKfJ3FGFWGoOsrDfv27XNwq1cKo7a21jl37pxDXHk1cUR1M38BISaDiZcff0HofRaC7tY09PX1OcSSVwrj5s2bzokTJ7xSMhJ06x4OwRKUiecx7cOF4mPo4k+CyG3dutUZHNSRmQxZt7Oz0yuFMT4+7jx48MArLYDY0zUVe2mLpNkkClBMrFF+XOzYsUPhEkLaUYJbY3WS6DkpXLhwIdaPTfpZ0ibRj3/M0PgTeX9QZWWleZVYXLx40a2urg4pltgNkbZx2tvbPQ0LaGtri/UhXj9OOmZCBzUXtnwSGqgnk0Vzc3OoTRLdrWkkBwYGTPvo6GhskRjmOsZ4O+mg1o9/1WHit8krev3Bes/pySTo4g+2pR0lSSR7e3tN26FDh2JtEOtKu+oEE4e6qCGoC/sM5ZACvecEvUp08atO19di59yxY8d0x5q+NpYvXbqkh0FIN3E/XlFRsdObO/ZYEMTUf24RBx+Q1/+FoBLznhP0KtHFH7xb03Dnzh3fchw9iRsJ631D/G1e7Lmlgv9g1UpIv6IcUiSSes/pybRSyHJJ5Ii9u1VVVe97c6Y+WAWZVMzNk5//Co0M/o1yTKnec8t99mtDKOaibvVkinkOLOfJL1gr+n+aSkpKWrDaX9TFlEPePJn0KtHFH8TY2Jg553SUJB1JnsxhtU5ib7Pm0pzUxf40Rc1oSfp/OyFYz6l/FLdq+6eCyfy/nboh4Om1JGKa/p+j/wz97y72t1NkkmDiDHJzWGoc8//MH/dqJq3z2mNgAmdkZMRcYYsBfffwzGEM8APE7jFuCNEgkYt9YUgliMyzS+chqQfEBEdLD8r7If4iRCtMrxUAPRPs1u+wsu69PyD3N4seJhU584UBiZk9tlM8qN662/94RFpOWsnV18Sq32IB62jXlZQKFnWDMT8SZ99D7Dbjhhm37I9HaQQFS1I7Sqd6HsdABimCaAlpCVYpxwIvMdHzTK7vgwpyhcUjZBCL9ZHqs9so1tKntxFSfX4TMbn0iT+/BWFJypoiKovmM7H/AROieYi+IZqQgahO8FnE/4ApUZ7m/+wDZhDWmhKRsCLC//sn4CBsf6UiY1Obt+12ckM0kLeEliRmYRU+CezYaGoRJbNsUo/hOP8AUSHYWiOhIkwAAAAASUVORK5CYII="
flowAsset["FlowStart"] = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsSAAALEgHS3X78AAABMElEQVRYw2NgGCKAGYoHjWPoDnKAuAzNEYz08mkmEN8F4l1AfBOI3ZHUsNDSATDDZwFxN5SdBsRPgHgNEIsjqWWipQMmA/FUJHEeIJ4DxC+BuJiW0QJzwBQoBgEOJHkLID4LxOeB2IoWiRSbA1igvkS2pACIXwDxPCDmg4oxUiNacDkAW7yLAfEqIH4KxCloZjDSygHYcoIrEF8H4qNArEtptBDrAAYs0VIPxK+AeAIQsyGFGBOtHIDNpwpAvB2IHwBxKDllBzkOwGZJMBDfA+KdQKxI6xBgQEukTEj6+oD4HRBX0csB2KJFFlqc5xKTOIe8AwY0CtAT4X16JcIBy4b4CiJWWhdE2IriI/QoigesMhrQ6nhAGiQD3iQbsEbpgDfLB7xjMqi6ZoOqc0pVAABy5U4Okre+2AAAAABJRU5ErkJggg=="
flowAsset["FlowEnd"] = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAaklEQVRYw2NgGAWjYDACZXkFdiCWoCLmJNUBK4D4PxXxTlIdsAWIlwGxPhXwDCA+So4DJlEpOhtHHTDqgFEHjDpg1AGjDhh1wKgDyHHAZiD+AsRPqIA/AfERUh1gAMRJVMRmo039UTBoAQCdWqOwTem1yAAAAABJRU5ErkJggg=="
flowAsset["FlowSendMsg"] = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsSAAALEgHS3X78AAABi0lEQVRYw+2XS07DMBCGnUcRgcRFAglxA/YcgEXPwDm4RZe9DYIFi/YIHACxzq6QhJfE47c0lkbWOKSp07LoSJ8aJZmHxzPjVKmd7OSfSgTigPZistnZuZUMFCDvSUE2JNutzkdgBkrQgJp+V8HqlGRr1CUIm3aj8ENUPZxbKmZn5vjwSkZRG6UJSIGmdLbhpl+T7oRslc52eKVg0acBCjBlWSy6KORs/7TzbCysfOwpMnutWU3kXQNonIgTMAdfTk1UdG/esrfc3loBLMA3reSVqOnegt6RqnytAHKhQPcdDv5o6cEDMByyTtCb3AKLVBOJ01XNEEUoDZ4gAfjaUHvmva8te7Xh1geRNIqPWJ9HLL2qZTT3GsXSYfQMPsGd4HzKVleHOIx8x7Ex8AGO6fkJuGHGX0Idx+4LRumMGTRyAR7J8RO4BHstBbrSB4kS9jmjXl+Ca/BOzm/B6RCfZNJptqT+timfOlU+qJi+fmMFeSUU7eByDx7AOZuMkdqgcIfJNv8vxGongeUXBsmzrWVm7yAAAAAASUVORK5CYII="
flowAsset["FlowSendButton"] = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAACxEAAAsRAX9kX5EAAAIoSURBVFhH7ZZJSgRBEEXbEecBBYcTuHflyoVncOUhxJU3EATxFh5BVHChR/AA4tIBEed5+q+7v2Rnl1VWd6OCfnhYVZ35IzIyKsvCv/71W9UkmkuXDRFeeFYp6SHP3kqXhU7RKnyfV3g9i7viXaV3UXECHtAmlsWc6Ck/i8dmyXOuxZpYFE/lZx9JtJT/WpSKH1fEgugWD6KW7SDQqxgUU4KFbAnH+FSU/VgwaEawBX2iNwMChDCHuXjghSfemcLsRlwJDOoVHnjhiXeFkkpLtsBvXTwIxAo6EmCrXAVWHgoPlx0yhQnZhhnTK7uCPaWpbiM8npW+iB3h/gr9uK5QnuYie3dwTM3KSsDmrMpdPSZGAkYDxgViLHMylacCFgdLCO82iaHc1chKgJUg7yf3p+Is4kQciUMRyx6JytsDnxGLZ/Ehl6ik7OhUVsNv7PelsHjFXG4r9mBRF6XLophDZUiKPuEtStWPH0Q0FllSiWmBwYDwWFYclhfTJHwU44EXnninykFWhfeXcj6KTREHXxJeHQF84Bh+sw+eKLXvvJ98jpnABwQjDPgqDgk0LNaFzemTOLgTwgMvPFHcM1UKBzCJRrQhmhT7gsAHghK3C0pOqUPYivALmBncCkuNAef9uZgX94LgG4KT8Cui7F8ObnkCKyM4R6tLzt5bjXhTUtUv+J+OwDTkrLBSG6qR2hZ7YqJ4V9qe3CWtR2HA8DX8dn1byf+KCoV32USUcP+HScIAAAAASUVORK5CYII="
flowAsset["FlowSendEmail"] = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAACxAAAAsQAa0jvXUAAASlSURBVFhHtddXqCVFEMbxNeccMGBcA0ZEHwTjmjBgFmQFRQwP4ov5wYCImBAUBQVfFAQRA0bEiBgx54gK5oBhMQdM6/c7Z+pu33Hu7rLiB3+mp2ZOT3V1dXWfafOhhbrrpeGP8F2HNhvVO/+bVgxfho3DIh3abJ4tsBburiUdD2l2qFEu1kFsnvXFPlVfg+qHsL2v9sXhr/BJhzYbte+3g+oPcFD1Y9fjw5Kjuzn2Gsky4YuwZoc2G9U79cHpYea4Ocm5uermIJw3hCWCH7Y/Xi746Bod2suHUn18vfBs0NeZDPMS728Jdwcj+imcEUq7hqvD4+GH8EF4v2s/Ea4Ju4fSPeGRsEJ4J5wVaDASjJsEL+4fDgoHhHXDjHBJ4OCd4anwYfg1+N1SYf2wQzgk/B1OCd+E18LRYdNwXBCxQZVX+4T7wmPh57BWkAtnB6PcK+wdNgyrBfo6iMSD4aGwSzg/iOLzYauwbNgpiJpvDa2YCSc2D6uHl4IRLx5OCjKeY+eELcId4fbgfbZHw8fh5MBpz58Mnq8dqL4xqPahj18xbo4++mLYbnQ3RxKrn1zbhheCD0tGOfNcmC9V9t4Ubg3m3DRIupJ3Fg2cdW3b9Xu6K/wS9CESNwZq3xmUBDRPlt/T4bbwajgyUK3zIVXnVovfyAd5s3T4KOwbaK5OCLUVYPlV6HRoRVA7TTpGqTqWhAePm6NBnB4OC6ZmrtotvBxUt0+D7G1VHxduujBUCS5b6yBJVokpCUWFc/SvKDAcEczXfuGt8HpgL/pLZ6WgyLTyjnc5YrreDG8Hy1teVFn2ziQxbBmUzj2DWkDsCgtKNcrWXjZXNo7YpMigFDMFzNZNf3bXSVJMhJ0TKtuQynN5MqvjQIaopqEVm+JlWSvTIms6FCl7xYR0bJP5Nqh+l4eLgtXQyuiM0vNDg9JrrSvHRmWEcDhpN6gh+ZZpXCdM16mSqpDI3HvDe+HK8Hugmo7aM3YOHLw+bBR+C4qWPcEGZa+gmh79qKpU+aRictTqG63/rbsbUWhVnRixkmyrlmC2YpGgVcLngfNyqF85+zJyiflw+JHhmaBYKD4nMkRt4RFmIzx8dDe+r0MLmUKHVMt5Xk60H5f0o6S8NpwbbDweEgeEXgQqClTJSOWk+VQ/7HyS74Qg6VzbBD0msJ8a2A3ElI2yVSEyn5+FDUKrcqD9OJWdA6Zn5dHdeL715YADOWOPeSAoUJUPcuD7cXNcrZRRFe5+hsjyEVbqf7xVOeBKNWpXUZWUTkWtnUzdhAOSTDIaxRvhuiDZ1HIacqAfgQXRyIHqXBLakmW15eKcWDLfNefVLgdWDf/JgepIp+r3ZUGnIuGAWaeakmMaWknCmoL60zKVJk2B0ddGooZvH2xKVwXzr/DYnh3ZHTJtwwoStI8Kar4V0N8fplJF3Huz25c90IlI+KC1fFp4NzgX7BjsFaJDKqiqKYGPDZsFp6H5ldUwq+9tOUFWxXnBveX0SrBMHdfIxqJyipozonPCBaGW2WiND8jyU77tOTOGwsWGcmSPYD93ynW+N3ekjH4VlHDHMKepbUJtuRXq/l4AUc70Tpv5D9Nn+rOeBlBFAAAAAElFTkSuQmCC"
flowAsset["FlowSendList"] = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsSAAALEgHS3X78AAABfUlEQVRYw+2XTUrDQBTH81VpMJMKCuIN3HsAFz2D5/AWXfY2ogs3dWWXPYC4zk5N6hdU/Q+8gcdjEsZkQhTy4EdJMu8jb/4zkwbBaKP9UQtB5DFeRDGdkxtLgQJZSxTFsMVuTD4BS1CALajo9zcYn4JiTVyKMG3XDt9E2SK5oWRxliJHraVUtXaagwTk1E4l2tvEjHznFKsQ01FrilWfeBBgwrqoXBwyNn+5mB7ZvlnD24dsjNFE5lrAVlSsE9+DNRPSCuwsGinp/orG7rNnnQpYWwr4ojd7ZVR0/85HAZmDYKcWUoum/mcBg0/BYCK0LcPQso3mfSzDwTci21Z8IDahSBTsbSu2HUbP4BPcUFtjNn7B3q7ycRjVHcc6wAc4pOdH4IoFf/F1HMsB2umEBdR2Bh4o8SM4B3skyM4fJHxgzDSh1/cTuATvlPwaHPfxSSarzSn5jrV8IVTeq2k1vzFBXtSshl7tFmzAKV3HbVraxXjCeMj/C1Ewmmf7AfyrtembDrpGAAAAAElFTkSuQmCC"
flowAsset["FlowWaitResponse"] = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAACxAAAAsQAa0jvXUAAASlSURBVFhHtddXqCVFEMbxNeccMGBcA0ZEHwTjmjBgFmQFRQwP4ov5wYCImBAUBQVfFAQRA0bEiBgx54gK5oBhMQdM6/c7Z+pu33Hu7rLiB3+mp2ZOT3V1dXWfafOhhbrrpeGP8F2HNhvVO/+bVgxfho3DIh3abJ4tsBburiUdD2l2qFEu1kFsnvXFPlVfg+qHsL2v9sXhr/BJhzYbte+3g+oPcFD1Y9fjw5Kjuzn2Gsky4YuwZoc2G9U79cHpYea4Ocm5uermIJw3hCWCH7Y/Xi746Bod2suHUn18vfBs0NeZDPMS728Jdwcj+imcEUq7hqvD4+GH8EF4v2s/Ea4Ju4fSPeGRsEJ4J5wVaDASjJsEL+4fDgoHhHXDjHBJ4OCd4anwYfg1+N1SYf2wQzgk/B1OCd+E18LRYdNwXBCxQZVX+4T7wmPh57BWkAtnB6PcK+wdNgyrBfo6iMSD4aGwSzg/iOLzYauwbNgpiJpvDa2YCSc2D6uHl4IRLx5OCjKeY+eELcId4fbgfbZHw8fh5MBpz58Mnq8dqL4xqPahj18xbo4++mLYbnQ3RxKrn1zbhheCD0tGOfNcmC9V9t4Ubg3m3DRIupJ3Fg2cdW3b9Xu6K/wS9CESNwZq3xmUBDRPlt/T4bbwajgyUK3zIVXnVovfyAd5s3T4KOwbaK5OCLUVYPlV6HRoRVA7TTpGqTqWhAePm6NBnB4OC6ZmrtotvBxUt0+D7G1VHxduujBUCS5b6yBJVokpCUWFc/SvKDAcEczXfuGt8HpgL/pLZ6WgyLTyjnc5YrreDG8Hy1teVFn2ziQxbBmUzj2DWkDsCgtKNcrWXjZXNo7YpMigFDMFzNZNf3bXSVJMhJ0TKtuQynN5MqvjQIaopqEVm+JlWSvTIms6FCl7xYR0bJP5Nqh+l4eLgtXQyuiM0vNDg9JrrSvHRmWEcDhpN6gh+ZZpXCdM16mSqpDI3HvDe+HK8Hugmo7aM3YOHLw+bBR+C4qWPcEGZa+gmh79qKpU+aRictTqG63/rbsbUWhVnRixkmyrlmC2YpGgVcLngfNyqF85+zJyiflw+JHhmaBYKD4nMkRt4RFmIzx8dDe+r0MLmUKHVMt5Xk60H5f0o6S8NpwbbDweEgeEXgQqClTJSOWk+VQ/7HyS74Qg6VzbBD0msJ8a2A3ElI2yVSEyn5+FDUKrcqD9OJWdA6Zn5dHdeL715YADOWOPeSAoUJUPcuD7cXNcrZRRFe5+hsjyEVbqf7xVOeBKNWpXUZWUTkWtnUzdhAOSTDIaxRvhuiDZ1HIacqAfgQXRyIHqXBLakmW15eKcWDLfNefVLgdWDf/JgepIp+r3ZUGnIuGAWaeakmMaWknCmoL60zKVJk2B0ddGooZvH2xKVwXzr/DYnh3ZHTJtwwoStI8Kar4V0N8fplJF3Huz25c90IlI+KC1fFp4NzgX7BjsFaJDKqiqKYGPDZsFp6H5ldUwq+9tOUFWxXnBveX0SrBMHdfIxqJyipozonPCBaGW2WiND8jyU77tOTOGwsWGcmSPYD93ynW+N3ekjH4VlHDHMKepbUJtuRXq/l4AUc70Tpv5D9Nn+rOeBlBFAAAAAElFTkSuQmCC"
flowAsset["FlowValidation"] = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsSAAALEgHS3X78AAACCElEQVRYw9VXvW7CMBBOnDQsLQMzc9WZjqVbxZYKnqJzJarSLiy8QbvRV2BhpQsTY+ncgTeAR0jP0mfJPfkcJ4BET/qUyHe+H/t8PkfRPyRFSPHlY8mxjMYVlSeYcxCyDWeEHmFCmBGWwAxjmtcQ5tZebk1NwpiwJRTAhrACNtb4DrJNpqPWsmvKoVQrnxMGhJZDXo/1IWMcuWe6Kht/hbIvQqfC/A7mFNBRyQnFjE8ZL7GyPgZSxjM0ZU6o0ITLHcaTACXKkXzGibwsMWMr4XZYQq7YfM8Jz4RPYES4EGQj6NpZiRn7oh/D4w4bN5PahB/IfAMFxtpMNrFyooBu7ypk8HTuiMIoXUBZ1+J1MbbwbMscxzjzRd+Dor4Q/RX4TxbfyAzBuxRWYQB+z7UKKb4TCLWYEhPFLYs+sebeMQOK6WiBP2E2/wjPUNUkOiNc48vvCGkFbNrAhnialiitVenGkwM2rWBDpBAHlBXdQ8kpCHYgdAs4rWF86KgDUZUtKEtCqWjp0/DoCMQl603CsmNYRqnHWekYKqkQbYVCtG9P4S1EIaWYk+583oFGic6gUswvo7Wwt7woFfiX5Eyyll5Gruv4w9Pf6ajfgIanjwy+jrnnLw4nlKfjjQ/RkPDtME6shZZMCUr3aslcTem2ZlOa1zV+Em153YdJdsiHyUk8zU7icXo0+gXGRpR7gx3/5AAAAABJRU5ErkJggg=="
flowAsset["FlowBranch"] = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAACxEAAAsRAX9kX5EAAAKuSURBVFhHvddJyE1hHMfxa54zlUTJsDBEJJFZCguJUhRZWLylyLiilA0lYaXYY6EsZINSxqRQktgYF4oVicx8v+89/7fbe859uqNffTrnPdc953n+5zn/c/UotT6es2d5tyt/8Le8297UPaFWVsBzOcupWILf2TFnfx2vkUuvbNtMPIcl7w0vehAz8T47tg6DcBe5tGIAzlpe3CzGWVzAffzECNxBLt0XS62JWzcaR3ECx3EEK9EfkeGougCbHcBsWO5LuIVreAvve+RHti1MowOIOJAHuAkHcQMvMQoxyKHoU97Np9kBWNqB5d2usr/DdpzDeazHC7QsziwGvhreexML2s9d9UMyMcDCNFIBZx3lLYqff8HnzFdUTbO3oDJVV3oqqQHUVUoSVfGZn48FWIi58PuFSTWiPTgM2+oa7MA3PIGr2sYzBRNwFQNg0zmELRgJ23IH/Pc2pVxSFRiDU9iMTbiISTDxbH9E3OPYOjAbkhPYi9OwkoVJVWAbfK5fdf5VKk2Ds7SkmoVV2bYflmJGdsy2az8w8+AjWncrHofKz/tm25YmVYHxeA5bq7H8LrBj8H4+xCc4e4/dy465LqxaVGA67Ia3O//qllQFBmMXdmMntiJ6fFRjGOLpiK2TOoCT8CXlrbQvFCbVUFI/LLyIx+2Ey7Gv4phVmgy/I5+MZ7AptSxx6ypbcaqaVdPQl6okVc2qaWQAXijVdv287S+jSOWLKd75LtorOJPxR4qNrDDN3gIvHh3QNm1SHTSXZgdgBebALrgWyzARHxCVslf4JBSm0QHEyR/hMby4j6w/SP9LB03FN+ii8m5nNmJ/eTefVCuuNZ7DGccr2mqswFj40toAW3Pb/2MSbfoNHMh3/MJTXIav7ran7mZU9xdqiOfsvritTizcipRK/wCAT4X/8miZ1gAAAABJRU5ErkJggg=="
flowAsset["FlowHttpCall"] = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMALcbAAC3GwAE6s595AAABG0lEQVQ4y7XTz0pCQRTHcfNFbGsuUgqCIJEQCiS17FKij+BCNMndzdqY1huU9Md0FenWReSb9T3wE26X260gBz4MDnPOzDl3jESWNFaQRBmnWNfar8Yh+igpiXFwgzy2woLPkMMJnvGieaQkY1yFnWzBbdwig12kcYBLtLQ3FlRzXwle8a6THjFAFzO8YU97v/QkqZqv9ftC8+IGNlzNtucIKW+Csjo9VNCD5ibqvjXrxxoqQQmesIN7zRZc863ZIXF/Aivh2FOC+0MJRWwENXEfE8zVh0UTO/jAFFn0EPV/iVXNLdUZ99zAHs8dGvoKzndvwVVwSQFjPaaBrm3B52EvcRsFPVtLktBNirq285c/U0qdrmIzqOZ/GZ9otzlnU9ooFQAAAABJRU5ErkJggg=="