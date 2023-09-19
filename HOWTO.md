# How to make your own Embedded CopyPasta 🍝
Thanks for taking the time to contribute. 

Here are some things to know:
- *.copy* files are just plain JSON
- *.pasta* files are [Embedded JavaScript](https://ejs.co/)
- Embedded Javascript (EJS) is a templating language
    - it takes just a few minutes to learn if you know JavaScript already
- *.copy* files contain data like include statements, class initialization or variable declaration, setup, and loop calls
- *.pasta* is where the data goes with the help of EJS
- the binary and Node.js package look for *.pasta* files in the `./pasta` folder
    - and the .copy files are in the `./copy` folder
- All the *.copy* (JSON) files are merged together to make list of includes, constructors, setups etc. 

## That was actually complicated...
Let's just look at an example then.

Open `./copy/microfire_mod-ph.copy` and remember it is just plain JSON. 

Then look at `./pasta/print.pasta`, this looks a little crazy, it is the EJS file. 

Notice that in `./copy/microfire_mod-ph.copy` it has `include`, `constructor` and several others? Now look through `./pasta/print.pasta` towards the top. 

```js
<% for(var i = 0; i < includes.length; ++i) {%>
<%-includes[i]%><%}%>
```

What is happening there is your normal JavaScript for loop, if you pretend the %> aren't there, you can see it. **Embedded CopyPasta 🍝** fills the `includes` variable with all the include lines from all the *.copy* files. In our example above, only one include file is there, so that EJS statement would render to

```cpp
#include <Microfire_Mod-pH.h>
```

It works the same way for the following *.copy* JSON entries:
- include
- constructor
- setup
- loop
- values. This is a little different, it looks like this `{value: [value], unit: [unit]}` and there can be several 
Any of them can be empty, but they must be empty arrays (ie. `loop:[]`).

When rendering, the following EJS variables will be merged from all the used *.copy* files.
- includes
- constructors
- setups
- loops
- values. This is now a flattened array of all the values
- units. This comes from the `values.unit` key in the *.copy* file and is a flattened array

Now that that is sorted, we can make our *.pasta* (template) file. `./pasta/print.pasta` looks like this:

```js
<% for(var i = 0; i < includes.length; ++i) {%>
<%-includes[i]%><%}%>
    
<% for(var i = 0; i < constructors.length; ++i) 
{%><%-constructors[i]%>
<%}%>
void setup()
{
    Serial.begin(9600);
    <% for(var i = 0; i < setups.length; ++i) {%>
    <%-setups[i]%><%}%>
}

void loop()
{<% for(var i = 0; i < loops.length; ++i) {%>
    <%-loops[i]%><%}%>
<% for(var i = 0; i < values.length; ++i) {%>
    Serial.println((String)"<%-units[i]%>: " + <%-values[i]%>);<%}%>

    delay(1000);
}
```

You can see...
- that the top EJS loop just pastes all the `#include` lines
- then the sensor library classes are initialized
- after that is the normal Arduino `setup()` function
- inside the `setup()` function, there is normally some setup done, most commonly for sensors it is a `::begin()` call. 
- in the `loop()` function, you call whatever updates the sensor, and in this example, it prints the value and it identifies that value by unit. 
    - notice that the index of `units[x]` and `values[x]` always refers to the same value/unit pair. 

So in short, the *.pasta* file is where everything comes together. This example just prints the values, but there are others that send measurements to AdafruitIO, or the Arduino IoT cloud. 

## It wasn't so hard...
Hopefully that explained enough to make you dangerously effective at making your own. Have a look through this repo's examples for how various things are handled. 

## Last things
- use specific class names
- avoid #ifdef for different boards
- use same line TODO comment on things that need attention
- include based on sketch link
- sensors manuf_sensor
- values must be valid c++ variable names