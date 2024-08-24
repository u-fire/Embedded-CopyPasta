// https://github.com/arduino-libraries/ArduinoMqttClient/blob/master/examples/WiFiSimpleSender/WiFiSimpleSender.ino
#include <Microfire_Mod-EC.h>
#include <WiFi.h>
#include <ArduinoMqttClient.h>

Microfire::Mod_EC::i2c ec;
#define WIFI_SSID "your_ssid"
#define WIFI_PASS "your_pass"
#define DEVICE "ESP32"
#define PORT 1883
#define BROKER "test.mosquitto.org"
WiFiClient wifiClient;
MqttClient mqttClient(wifiClient);
    
void setup()
{
    Serial.begin(9600);
    WiFi.begin(WIFI_SSID, WIFI_PASS);
    while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    }
    ec.begin();
    mqttClient.connect(BROKER, PORT);
}

void loop()
{
    ec.measureEC(/* temperature in C */);
    mqttClient.poll();

    mqttClient.beginMessage((String)DEVICE + "_mS");
    mqttClient.print(ec.mS);
    mqttClient.endMessage();
    mqttClient.beginMessage((String)DEVICE + "_uS");
    mqttClient.print(ec.uS);
    mqttClient.endMessage();
    
    delay(1000);
}