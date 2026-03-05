const canvas = document.getElementById("game")
const ctx = canvas.getContext("2d")

canvas.width = window.innerWidth
canvas.height = window.innerHeight

let money = 100
let factories = []
let soldiers = []

let startTime = Date.now()
let peaceTime = 60000 // 1 minute

let countries = [

{ name:"Russia", owner:"player", troops:40,
points:[[200,220],[420,200],[500,260],[470,380],[260,400],[160,300]],
lake:[330,300,18] },

{ name:"Kazakhstan", owner:"enemy", troops:25,
points:[[470,380],[620,360],[690,420],[600,500],[430,460]],
lake:[550,420,12] },

{ name:"China", owner:"enemy", troops:30,
points:[[690,420],[900,400],[980,500],[840,580],[650,520]] },

{ name:"India", owner:"enemy", troops:20,
points:[[650,520],[840,580],[820,680],[640,700],[580,600]],
lake:[720,620,15] },

{ name:"Europe", owner:"enemy", troops:30,
points:[[200,120],[380,110],[420,200],[200,220],[120,160]] },

{ name:"MiddleEast", owner:"enemy", troops:18,
points:[[420,200],[600,240],[560,340],[380,300]] },

{ name:"Africa", owner:"enemy", troops:25,
points:[[380,300],[560,340],[600,520],[420,540],[300,420]] },

{ name:"Japan", owner:"enemy", troops:12,
points:[[1020,380],[1080,420],[1040,480],[980,430]] },

{ name:"USA", owner:"enemy", troops:35,
points:[[40,260],[200,240],[260,360],[120,440],[40,380]] },

{ name:"Canada", owner:"enemy", troops:22,
points:[[40,120],[220,100],[260,240],[40,260]] },

{ name:"Brazil", owner:"enemy", troops:24,
points:[[160,460],[340,480],[380,620],[220,700],[120,600]],
lake:[260,560,14] }

]

function centerOf(country){
let x=0,y=0
country.points.forEach(p=>{
x+=p[0]
y+=p[1]
})
return {x:x/country.points.length,y:y/country.points.length}
}

function updateUI(){
document.getElementById("money").textContent = Math.floor(money)
document.getElementById("factories").textContent = factories.filter(f=>f.owner==="player").length
document.getElementById("soldiers").textContent = soldiers.filter(s=>s.owner==="player").length
}

function buildFactory(){

if(money < 100) return

let owned = countries.filter(c=>c.owner==="player")
if(owned.length === 0) return

let c = owned[Math.floor(Math.random()*owned.length)]
let center = centerOf(c)

money -= 100

factories.push({
x:center.x + Math.random()*60-30,
y:center.y + Math.random()*60-30,
owner:"player"
})

}

function trainSoldier(){

if(money < 10) return

let start = centerOf(countries[0])

money -= 10

soldiers.push({
x:start.x,
y:start.y,
target:null,
owner:"player"
})

}

canvas.addEventListener("click",e=>{

if(Date.now() - startTime < peaceTime) return

const rect = canvas.getBoundingClientRect()
const mx = e.clientX - rect.left
const my = e.clientY - rect.top

countries.forEach(c=>{

let center = centerOf(c)
let dist = Math.hypot(mx-center.x,my-center.y)

if(dist < 80 && c.owner !== "player"){

soldiers.forEach(s=>{
if(s.owner==="player") s.target=c
})

}

})

})

function drawCountries(){

countries.forEach(c=>{

ctx.beginPath()
ctx.moveTo(c.points[0][0],c.points[0][1])

for(let i=1;i<c.points.length;i++){
ctx.lineTo(c.points[i][0],c.points[i][1])
}

ctx.closePath()

ctx.fillStyle = c.owner==="player" ? "#c40000" : "#444"
ctx.fill()

ctx.strokeStyle="#111"
ctx.lineWidth=2
ctx.stroke()

let center = centerOf(c)

ctx.fillStyle="white"
ctx.font="14px Arial"
ctx.fillText(c.name,center.x-25,center.y)

ctx.fillStyle="yellow"
ctx.font="13px Arial"
ctx.fillText("👥 "+c.troops,center.x-20,center.y-15)

if(c.lake){
ctx.beginPath()
ctx.arc(c.lake[0],c.lake[1],c.lake[2],0,Math.PI*2)
ctx.fillStyle="#3aa6ff"
ctx.fill()
}

})

}

function drawFactories(){

factories.forEach(f=>{

ctx.fillStyle="#777"
ctx.fillRect(f.x-10,f.y-10,20,20)

ctx.fillStyle="#333"
ctx.fillRect(f.x-3,f.y-18,6,8)

ctx.fillStyle="#aaa"
ctx.fillRect(f.x-8,f.y-5,16,5)

})

}

function drawSoldiers(){

soldiers.forEach(s=>{

ctx.beginPath()
ctx.arc(s.x,s.y,5,0,Math.PI*2)
ctx.fillStyle="#00ff88"
ctx.fill()

ctx.fillStyle="#003322"
ctx.fillRect(s.x-4,s.y-2,8,3)

})

}

function moveSoldiers(){

soldiers.forEach((s,i)=>{

if(!s.target) return

let center = centerOf(s.target)

let dx=center.x-s.x
let dy=center.y-s.y
let dist=Math.hypot(dx,dy)

if(dist>3){

s.x += dx/dist*0.4
s.y += dy/dist*0.4

}else{

let attack = soldiers.filter(x=>x.target===s.target && x.owner===s.owner).length

if(attack>0){

let result = attack - s.target.troops

if(result>0){
s.target.owner=s.owner
s.target.troops=result
}else{
s.target.troops=Math.abs(result)
}

}

soldiers.splice(i,1)

}

})

}

function economy(){

factories.forEach(f=>{
if(f.owner==="player") money += 0.005
})

}

function enemyAI(){

if(Date.now() - startTime < peaceTime) return

countries.forEach(c=>{

if(c.owner!=="enemy") return

if(Math.random()<0.0015){

let center=centerOf(c)

factories.push({
x:center.x+Math.random()*50-25,
y:center.y+Math.random()*50-25,
owner:"enemy"
})

}

if(Math.random()<0.002){

let center=centerOf(c)

soldiers.push({
x:center.x,
y:center.y,
owner:"enemy",
target:countries[Math.floor(Math.random()*countries.length)]
})

}

})

}

function gameLoop(){

ctx.clearRect(0,0,canvas.width,canvas.height)

economy()
enemyAI()
moveSoldiers()

drawCountries()
drawFactories()
drawSoldiers()

updateUI()

requestAnimationFrame(gameLoop)

}

gameLoop()
