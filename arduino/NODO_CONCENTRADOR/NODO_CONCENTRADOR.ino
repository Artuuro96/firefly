#include <ArduinoJson.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
const char* ssid = "IZZI-2A92";
const char* password = "F88B37412A92";
const float tiempo_milisegundos = 3600000.0;
String luminaria = "0";
float Sensibilidad=0.139; //sensibilidad en V/A para nuestro sensor
float offset=0.100; // Equivale a la amplitud del ruido
String tipo="controlar_luminaria0";
int nivel_logico = LOW;
//const char* ssid = "josue";
//const char* password = "123456789";

struct mediciones {
    float corriente;
    float potencia;
    float energia;
};

struct datosget {
    int error;
    float voltaje;
    float retardo;
};
class nodo_concentrador {
    protected: 
        float voltaje;
        String postData;
        float voltajeSensor;
        float corriente=0;
        long tiempo=millis();
        float Imax=0;
        float Imin=0;
        float Ip = 0;
            
    public:
        struct mediciones monitorea (int retardo) {
            struct mediciones medicion;
            String str = Serial.readStringUntil('\n');
            float data = str.toFloat();
            Serial.println("=================");
            Serial.print(data);
            medicion.corriente = data/120;
            medicion.potencia = data;
            medicion.energia = (medicion.potencia)*(2000/tiempo_milisegundos);
            return medicion;
        }
        
        struct datosget http_get () {
            HTTPClient http;
            struct datosget datos;
            http.begin("http://192.168.0.8:4000/api/controlar/luminaria0");   
            int httpCode = http.GET();
            if(httpCode > 0) {
                StaticJsonBuffer<200> jsonBuffer;
                String payload = http.getString();
                Serial.println("Respuesta GET: ");
                Serial.println(payload);
                JsonObject& root = jsonBuffer.parseObject(payload);
                if (!root.success()) {
                     Serial.println("parseObject() failed");
                     datos.error = 1;
                     return datos;
                }
                datos.retardo = root["retardo"];
                datos.voltaje = root["voltaje"];
                return datos;
            }
            http.end();
        }

        float obtener_corriente() {
              voltajeSensor = analogRead(A0) * (5.0 / 1023.0);//lectura del sensor
   
              corriente=0.9*corriente+0.1*((voltajeSensor-3.527)/Sensibilidad); //EcuaciÃ³n  para obtener la corriente
          
              if(corriente>Imax)Imax=corriente;
              if(corriente<Imin)Imin=corriente;
              return(((Imax-Imin)/2)-offset);  
        }

        void http_post (String corriente, String potencia, String energia) {
             HTTPClient http;
             postData = "tipo=" + tipo + "&luminaria=" + luminaria + "&potencia=" + potencia + "&corriente=" + corriente + "&energia=" + energia;
             http.begin("http://192.168.0.8:4000/api/monitorear/luminaria0");              //Specify request destination
             http.addHeader("Content-Type", "application/x-www-form-urlencoded");    //Specify content-type header
             int httpCode = http.POST(postData);   //Send the request
             String payload = http.getString();    //Get the response payload
             Serial.println("Respuesta POST: ");
             Serial.println(payload);
             Serial.println(httpCode);   //Print HTTP return code
             http.end();
        }
};

void setup() {
    Serial.begin(9600);
    WiFi.begin(ssid,password);
    StaticJsonBuffer<200> jsonBuffer;
    pinMode(D0, OUTPUT); 
    while(WiFi.status() != WL_CONNECTED) {


      
        delay(1000);
        Serial.print("Connecting");
    }  
}

void loop() {
   if(WiFi.status() == WL_CONNECTED ){
      nodo_concentrador nodo;
      struct datosget datos = nodo.http_get();
      int retardo = datos.retardo;
      int voltaje = datos.voltaje;
      Serial.println(voltaje);
      if(voltaje == 1023){
          digitalWrite(D0, HIGH); 
      }
      if(voltaje == 0) {
          digitalWrite(D0, LOW); 
      }
      delay(2000);                                                                                                                                                                      
      struct mediciones medicion = nodo.monitorea(retardo);
      String corriente = String(medicion.corriente, 8);
      String potencia = String(medicion.potencia, 8);
      String energia = String(medicion.energia, 8);
      nodo.http_post(corriente, potencia, energia);
   }
  
}
