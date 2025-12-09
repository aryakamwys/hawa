// ================= LIBRARIES =================
#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <U8x8lib.h>
#include "Adafruit_AHTX0.h"
#include "Seeed_BMP280.h"
#include <ArduinoJson.h>
#include <math.h>

// ================= PIN =================
#define PM25_PIN 7
#define PM10_PIN 8
#define BUTTON_PIN 2
#define BUZZER_PIN 6

// ================= WIFI & SERVER =================
const char* ssid = "realme7";
const char* password = "yayayakali";
const char* serverURL = "https://script.google.com/macros/s/AKfycbyiv7RjR0zgwSecyyoMqEE-UC4P81fOh_H-mtfizF-50Wwa67guWCXoHXfgN2xAhDYR/exec";

// ================= SENSOR =================
Adafruit_AHTX0 aht;
BMP280 bmp;
U8X8_SSD1306_128X64_NONAME_HW_I2C oled(U8X8_PIN_NONE);

// ================= VARIABLES =================
unsigned long sampleTime = 30000;
unsigned long startTime;
unsigned long low25 = 0;
unsigned long low10 = 0;

float pm25Smooth = 0;
float pm10Est = 0;

const float EMA = 0.2;
const float BUZZER_THRESHOLD = 55.0;

unsigned long lastDraw = 0;
int currentPage = 0;
bool buttonPressed = false;

// ================= FUNC =================
void showSplash() {
    oled.clear();
    oled.setCursor(0,1);
    oled.print("Hawa Monitor");
    oled.setCursor(0,2);
    oled.print("SL2 Indonesia");
    oled.setCursor(0,4);
    oled.print("DSM501A Ready");
    delay(2000);
    oled.clear();
}

String airQuality(float pm) {
    if (pm <= 12) return "GOOD";
    if (pm <= 35) return "MODERATE";
    return "UNHEALTHY";
}

void setup() {
    Serial.begin(115200);
    Wire.begin();
    oled.begin();
    oled.setFont(u8x8_font_chroma48medium8_r);

    showSplash();

    pinMode(PM25_PIN, INPUT_PULLUP);
    pinMode(PM10_PIN, INPUT_PULLUP);
    pinMode(BUTTON_PIN, INPUT_PULLUP);
    pinMode(BUZZER_PIN, OUTPUT);
    digitalWrite(BUZZER_PIN, LOW);

    if (!aht.begin()) { oled.clear(); oled.print("AHT20 FAIL"); while(1); }
    if (!bmp.init()) { oled.clear(); oled.print("BMP280 FAIL"); while(1); }

    oled.clear();
    oled.print("WiFi Connect...");
    WiFi.begin(ssid, password);

    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }

    Serial.println("\nWiFi Connected!");

    startTime = millis();
}

void loop() {

    if (digitalRead(PM25_PIN) == LOW) low25++;
    if (digitalRead(PM10_PIN) == LOW) low10++;

    if (!digitalRead(BUTTON_PIN)) {
        if (!buttonPressed) {
            currentPage = !currentPage;
            buttonPressed = true;
            delay(150);
        }
    } else buttonPressed = false;

    if (millis() - startTime >= sampleTime) {

        float duty25 = ((float)low25 / sampleTime) * 100.0;
        float ratio25 = duty25 / 100.0;
        float pm25Raw = ratio25 * 280;
        if (pm25Raw < 0) pm25Raw = 0;

        if (pm25Smooth == 0) pm25Smooth = pm25Raw;
        else pm25Smooth = EMA * pm25Raw + (1 - EMA) * pm25Smooth;

        pm10Est = pm25Smooth * 1.3;

        digitalWrite(BUZZER_PIN, pm25Smooth >= BUZZER_THRESHOLD ? HIGH : LOW);

        sensors_event_t hum, temp;
        aht.getEvent(&hum, &temp);

        float pressure = bmp.getPressure() / 100.0f;
        float altitude = 44330.0 * (1.0 - pow(pressure / 1013.25, 0.1903));
        String deviceID = WiFi.macAddress();

        Serial.printf("PM25=%.1f PM10=%.1f AQ=%s\n",
            pm25Smooth, pm10Est, airQuality(pm25Smooth).c_str());

        // ================= SEND TO GOOGLE SHEETS =================
        if (WiFi.status() == WL_CONNECTED) {

            HTTPClient http;
            http.begin(serverURL);
            http.addHeader("Content-Type", "application/json");

            String json = "{";
            json += "\"pm25raw\":" + String(pm25Raw,1);
            json += ",\"pm25density\":" + String(pm25Smooth,1);
            json += ",\"pm10density\":" + String(pm10Est,1);
            json += ",\"air\":\"" + airQuality(pm25Smooth) + "\"";
            json += ",\"temp\":" + String(temp.temperature,1);
            json += ",\"hum\":" + String(hum.relative_humidity,1);
            json += ",\"pressure\":" + String(pressure,1);
            json += ",\"altitude\":" + String(altitude,1);
            json += ",\"device\":\"" + deviceID + "\"";
            json += "}";

            // ================= ADDED: PRINT JSON =================
            Serial.println("JSON SENT:");
            Serial.println(json);
            Serial.println("----------------------------------");
            // ================= END ADDED =================

            int httpCode = http.POST(json);
            Serial.printf("Google Sheets Response: %d\n", httpCode);

            http.end();
        }

        low25 = 0;
        low10 = 0;
        startTime = millis();
    }

    if (millis() - lastDraw > 300) {
        oled.clear();

        if (currentPage == 0) {
            oled.setCursor(0,0); oled.print("PM MONITOR");
            oled.setCursor(0,2); oled.print("PM2.5: "); oled.print(pm25Smooth,0);
            oled.setCursor(0,3); oled.print("PM10*: "); oled.print(pm10Est,0);
            oled.setCursor(0,5); oled.print(airQuality(pm25Smooth));
        } 
        else {
            sensors_event_t hum, temp;
            aht.getEvent(&hum, &temp);
            float pressure = bmp.getPressure() / 100.0f;

            oled.setCursor(0,0); oled.print("ENV MONITOR");
            oled.setCursor(0,2); oled.print("Temp: "); oled.print(temp.temperature,1);
            oled.setCursor(0,3); oled.print("Hum : "); oled.print(hum.relative_humidity,0);
            oled.setCursor(0,4); oled.print("Pres: "); oled.print(pressure,1);
        }

        lastDraw = millis();
    }

    vTaskDelay(1);
}
