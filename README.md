# Conway's Game of Life  
## Controls  
**Mouse** - click/click&move to make cells *live* or *dead*  
**WASD keys** - camera movement  
**+/- keys** - camera scaling  
**E/Q keys** - increasing/decreasing ticks speed  
**Space** - pause/unpause game  
**C** - enable/disable the visibility of cell borders  
**T** - get game status as JSON string  
**L** - load game status as JSON string  
**R** - set camera position to (0, 0) point  
## Some interesting configurations in game of life  
Below are some interesting Game of Life configurations. You can load them by pressing *L* and pasting string to the pop-up window  
### Gosper glider gun  
**Gosper glider gun** in Game of Life is a configuration that periodically emits *gliders*  
![image](https://user-images.githubusercontent.com/88852731/160848040-9aa3e6ce-d27b-43d5-83aa-42167b2949e2.png)  
```JSON
{"2":{"5":true,"6":true},"3":{"5":true,"6":true},"8":{},"12":{"5":true,"6":true,"7":true},"13":{"4":true,"8":true},"14":{"3":true,"9":true},"15":{"3":true,"9":true},"16":{"6":true},"17":{"4":true,"8":true},"18":{"5":true,"6":true,"7":true},"19":{"6":true},"22":{"3":true,"4":true,"5":true},"23":{"3":true,"4":true,"5":true},"24":{"2":true,"6":true},"26":{"1":true,"2":true,"6":true,"7":true},"36":{"3":true,"4":true},"37":{"3":true,"4":true}}
```  
## 10-cells puffer train
**Train** is a configuration that moves itself in some direction, and leaves a trail of some stable cells configurations. Here is a very simple configuration that in few time turns itself into the train
![image](https://user-images.githubusercontent.com/88852731/160854673-3e884408-98b1-4877-be06-0d013db3afc1.png)
```JSON
{"7":{"9":true},"9":{"8":true,"9":true},"11":{"5":true,"6":true,"7":true},"13":{"4":true,"5":true,"6":true},"14":{"5":true}}
```
