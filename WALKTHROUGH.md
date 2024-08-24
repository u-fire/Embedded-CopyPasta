# Walkthrough for the Adafruit DHT Sensor Library
Let's make a copypasta for the DHT11/22 sensors using the Adafruit library.

The GitHub repo is [here](https://github.com/adafruit/DHT-sensor-library).

And the PlatformIO library pages is [here](https://registry.platformio.org/libraries/adafruit/DHT%20sensor%20library). 

Assuming you have a working installation of Embedded CopyPasta 🍝, let's get started.

1. copy any of the `./json` files to `./copy/adafruit_dht.json` and open it for editing
    - `"version": "",` will change to `"version": "1.4.4",` since that is the library's version
    - `"name": "",` will be `"name": "DHT sensor library",`, also from the library
    - `"dependencies": [],` is the PlatformIO `lib_deps` entry. You can find it on the PlatformIO library page from above. The line will now read `"dependencies": ["adafruit/DHT sensor library@^1.4.4"],`. If you notice, on the bottom right of the PlatformIO page, it has a section titled Dependencies. It lists one library, Adafruit Unified Sensor. You could add this as a separate line, but it *normally* isn't needed. PlatformIO already knows it is needed and will install it along with the DHT sensor library. **BUT** this library doesn't compile without including that dependency in the list, so, for this particular library, our line needs to read `"dependencies": ["adafruit/DHT sensor library@^1.4.4", "adafruit/Adafruit Unified Sensor @ ^1.1.4"],`. This is just some particularity between Arduino <-> PlatformIO library management. Fixing these sorts of issues here will fix it for many people later who use this (with PlatformIO at least). 
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
    `values[0].values` is the name the variable we declared in our loop statement. `values[0].unit` doesn't have to be the same, but it will be used as a variable in the *.handlebars* file. Note, there are no semicolons, so `dht_humidity` can be used in something like `Serial.println(dht_humidity);`. 

2. We can run this through with this command
`ecp.js -j copy/adafruit_dht.json -t pasta/print.handlebars -o dht` and it should render this:

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


### Ask a question 🤙

*   [Discord](https://discord.gg/rAnZPdW)
*   [questions@microfire.co](mailto:questions@microfire.co)