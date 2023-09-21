# Walkthrough for the Adafruit DHT Sensor Library
Let's make a copypasta for the DHT11/22 sensors using the Adafruit library.

The GitHub repo is [here](https://github.com/adafruit/DHT-sensor-library).

And the PlatformIO library pages is [here](https://registry.platformio.org/libraries/adafruit/DHT%20sensor%20library). 

Assuming you have a working installation of Embedded CopyPasta 🍝, let's get started.

1. there are blanks in the `./copy/blank` and `./pasta/blank` folders
2. make a copy of `./copy/blank/blank.copy` to `./copy/adafruit_dht.copy` and open it for editing
    - `"version": "",` will change to `"version": "1.4.4",` since that is the library's version
    - `"name": "",` will be `"name": "DHT sensor library",`, also from the library
    - `"dependencies": [],` is the PlatformIO lib_deps entry. You can find it on the PlatformIO library page from above. The line will now read `"dependencies": ["adafruit/DHT sensor library@^1.4.4"],`. If you notice, on the bottom right of the PlatformIO page, it has a section titled Dependencies. It lists one library, Adafruit Unified Sensor. You could add this as a separate line, but it *normally* isn't needed. PlatformIO already knows it is needed and will install it along with the DHT sensor library. **BUT** this library doesn't compile without including that dependency in the list, so, for this particular library, our line needs to read `"dependencies": ["adafruit/DHT sensor library@^1.4.4", "adafruit/Adafruit Unified Sensor @ ^1.1.4"],`. This is just some particularity between Arduino <-> PlatformIO library management. Fixing these sorts of issues here will fix it for many people later who use this (with PlatformIO at least). 
    - `"include": [],` is the various `#include` statements for the sensor. For this example, we'll go by [this example](https://github.com/adafruit/DHT-sensor-library/blob/master/examples/DHTtester/DHTtester.ino). The line will read `"include": ["#include <DHT.h>"],`. 
    - `"constructor": [],` is all the information needed to create the sensor that occurs outside of a function. For this sensor, we need to make 2 assumptions: the pin the signal line is connected to and the sensor type. To ensure this project will compile immediately, we will make those choices and notate them in the source. Our new line will now say `"constructor": ["DHT dht(/* pin number */ 2, /* sensor type */ DHT22);"],`. The user may need to make changes after the code is rendered, but knowing it compiles as rendered, is a helpful starting point. 
    - `"setup": [],` is placed inside the `setup()` function and will be `"setup": ["dht.begin();"],`. 
    - `"loop": [],` goes inside the `loop()` function. For this sensor, we need to make two calls, one for temperate and one for humidity. The library doesn't have a method to retrieve the sensor value (ie. dht.temperature) so it needs to be saved into a variable. To prevent naming collisions, we'll make descriptive names. Our new line will look like this: `"loop": ["float dht_humidity = dht.readHumidity();", "float dht_temperature = dht.readTemperature();"],`.
    - `values[]` is where the code to access to sensor readings is held along with the unit of measure. 
    ```json
    "values": [
        {"value": "dht_humidity", "unit": "dht_humidity"},
        {"value": "dht_temperature", "unit": "dht_temperature"}
    ]
    ```
    `values[0].values` is the name the variable we declared in our loop statement. `values[0].unit` doesn't have to be the same, but it will be used as a variable in the *.pasta* file, and it is descriptive and works well. Note, there are no semicolons, so `dht_humidity` can be used in something like `Serial.println(dht_humidity);`. 

    The entire `./copy/adafruit_dht.copy` file should look like this:

3. We can run this through with this command
`ecp.js -c copy/adafruit_dht.copy -p pasta/print.pasta -o dht` and it should render this:

```cpp
#include <DHT.h>

DHT dht(/* pin number */ 2, /* sensor type */ DHT22);

void setup()
{
    Serial.begin(9600);

    dht.begin();
}

void loop()
{
    float dht_humidity = dht.readHumidity();
    float dht_temperature = dht.readTemperature();

    Serial.println((String)"dht_humidity: " + dht_humidity);
    Serial.println((String)"dht_temperature: " + dht_temperature);

    delay(1000);
}
```
4. Now onto the next file. Copy `./pasta/blank/blank.copy` to `./pasta/lora.copy` and open it. For this walkthrough, we'll make a fairly simple LoRa sender based on [this library](https://github.com/sandeepmistry/arduino-LoRa/). 
    - changing `"board": "*",` isn't needed in this case, since nearly any board could have a LoRa module attached to it. But if this code was ESP32 specific, or RP2040 specific, that's where to note it. 
    - `name: ""` can be whatever you'd like to call this and will be used for display purposes.
    - the rest of the sections match the above *.copy* file. The only difference is that the contents of this file will always be placed at the top of the merged JSON arrays.
 
5. Copy `./pasta/print.pasta` to `./pasta/lora.pasta` and open it. 
```js
// based on https://github.com/sandeepmistry/arduino-LoRa/blob/master/examples/LoRaSender/LoRaSender.ino 
<% for(var i = 0; i < includes.length; ++i) {%>
<%-includes[i]%><%}%>
<% for(var i = 0; i < constructors.length; ++i) {%>
<%-constructors[i]%><%}%>

void setup()
{
    Serial.begin(9600);
    if (!LoRa.begin(915E6)) {
        Serial.println("Starting LoRa failed!");
        while (1);
    }
    <% for(var i = 0; i < setups.length; ++i) {%>
    <%-setups[i]%><%}%>
}

void loop()
{<% for(var i = 0; i < loops.length; ++i) {%>
    <%-loops[i]%><%}%>

    LoRa.beginPacket();<% for(var i = 0; i < values.length; ++i) {%>
    LoRa.print(<%-values[i]%>);<%}%>
    LoRa.endPacket();
}
```
These files are [Embedded JavaScript](https://ejs.co/) and that is Javascript inside the <% and %> tags. The variables `includes`, `constructors`, `setups`, `loops`, `values`, and `units` have been filled in from all the used *.copy* files. You access them by index and use them wherever you need them to be in the rendered code. Everything outside the tags is rendered exactly as-is. 

There are some [online editors](https://ionicabizau.github.io/ejs-playground/) that make the process a little easier. Some starting code to get the the hang of it would be this:

```js
<%
    var includes = ["#include <SPI.h>", "#include <LoRa.h>"]
%>
<% for(var i = 0; i < includes.length; ++i) {%>
<%-includes[i]%><%}%>
```

### Ask a question 🤙

*   [Discord](https://discord.gg/rAnZPdW)
*   [questions@microfire.co](mailto:questions@microfire.co)