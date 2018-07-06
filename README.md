# bottles
A bot-combat game written on node


# Writing a Bot to connect
system process 1 tick per second, your bot can provide 1 command (last command send in the tick is used)
system then sends back the feedback for that tick
## Commands:
* F -> Move Forward
* R -> Turn Right
* L -> Turn Left
* S -> Shoot
* anything else -> Do nothing

## Feedback
```
x:y:<facing>         // your location and orientation
<distance><wall/bot> // distance you can see/what you see (a wall or a bot)
D<facing>            // 0 or more of these - you took damage from this direction
H<distance>          // distance to a bot you hit
HP<hp>               // your current HP
```