# Embedded CopyPasta 🍝
>copy and paste Arduino libraries and sensors together automatically
---

Ever notice that a lot of Arduino code is boilerplate? 

1. Find/download/`#include` library
2. Initialize class
3. `:begin()` class in `setup()`
4. Do something in `loop()`
5. Display or send some data

Embedded CopyPasta makes it easy to do all that automatically. Plus, it will make a PlatformIO project for you, download the libraries needed, and setup the build environment. 
* pick starting templates like InfluxDB, AdafruitIO, or just `Serial.println()`
* add as many sensors as you want
* *do what you wanted to do quicker*

## Ok, sounds good
There are options to get started. This is a Node.js project so you can clone the repo and run it that way
```bash
git clone https://www.github.com/u-fire/ecp.git
cd ecp
npm install
node ecp -h
```

### Want an example?
Let's say we have a DS18B20 temperature sensor and we just want to see some data from it.

1. Open a terminal and `cd` into the directory with ecp in it
2. type `node ecp -j json/dallas_ds18b20.json -t templates/print.handlebars -o ds18b20`

You should see the following:

```cpp
#include <OneWire.h>
#include <DallasTemperature.h>

OneWire oneWire(/* signal pin connected to MCU */ 2);
DallasTemperature ds18b20(&oneWire);

void setup()
{
    Serial.begin(9600);

    ds18b20.begin();
}

void loop()
{
    ds18b20.requestTemperatures();
    float tempC = ds18b20.getTempCByIndex(0);

    Serial.println((String)"tempC: " + tempC);

    delay(1000);
}
```

Not bad, right? You might have noticed it said `No board specified to make PlatformIO project. Use -b to pass board identifier`. If you pass a [PlatformIO board identifier](https://docs.platformio.org/en/latest/boards/index.html), it will make and save the code, then make a PlatformIO project. **PlatformIO can download the libraries and create the build environment automatically for you. **

Enter this `node ecp -j json/dallas_ds18b20.json -t templates/print.handlebars -o ds18b20 -b uno` and you should see the project created and compiled. If everything worked, you will see `Looks like everything worked, the project is in /[path]/ds18b20`

For this example, you might want to change which pin the sensor is connected to, possible TODOs are marked in the code with /**/ comments. You can add more sensors, remake it using a different template, or just do whatever you wanted to from here. 

## But what if the sensors/templates I want aren't listed?
Maybe AI can make them? Until somebody figures it out, you'll have to make the files on your own. Yes, I know that would take longer than just getting on with your project, but it would be saving time for everyone who comes after you. Or you could bug the sensor manufacturer to make one. 

### Fine, I'll make one
Awesome! [Read about how to make one here](HOWTO.md), it isn't hard, just some JSON and JavaScript. 







