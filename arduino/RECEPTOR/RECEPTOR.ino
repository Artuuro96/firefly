#include <ArduinoJson.h>

char aux[20];
String cadena = "";
char prueba[20];
short int tx_rx;

void setup() {
  Serial.begin(9600);
  
}
void loop(){
    if (Serial.available())
    {   
        String tx_rx = Serial.readStringUntil('\n');
        String Xbee = Serial.readStringUntil('\n');
        String voltaje = Serial.readStringUntil('\n');
       
        if(tx_rx.toInt() == 1){
          tx_rx = 1;
          Serial.println(tx_rx);
          Serial.println(voltaje.toFloat());
          Serial.println(Xbee.toInt());
        }
        /*
        for(int i = 0; i < datos.length() ; i++) {
            if(datos[i] == '|'){
                Serial.println(contador);
                contador = contador + 1;
            }
        }
        contador = 0;
        for(int i = 0; i < datos.length() ; i++){
          if(datos[i] != '|'){
              if(datos[i] != ',' && ayuda == 0){
                voltaje[i] = voltaje[i] + datos[i];
                Serial.println(voltaje[i]);
              }
              else{
                  xbee_id[i] = xbee_id[i] + datos[i];
              }
              ayuda = 0;
              }
          else{
          }
        }
         Serial.println(voltaje);
         Serial.println(xbee_id);*/
    }
}

