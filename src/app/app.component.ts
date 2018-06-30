import { Component, NgZone } from '@angular/core';
import { Platform, LoadingController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { BarcodeScanner, BarcodeScannerOptions, BarcodeScanResult } from '@ionic-native/barcode-scanner';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { BackgroundGeolocation } from '@ionic-native/background-geolocation';
import { Camera, CameraOptions } from '@ionic-native/camera';

import 'rxjs/add/operator/filter';

import { HomePage } from '../pages/home/home';
@Component({
  selector: 'page-home',
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any = HomePage;

  optionsDeCodebare: BarcodeScannerOptions;

  dataFromBarcodeScanner: BarcodeScanResult;
  dataFromSqlite: any = [];

  logError: any;
  private db: SQLiteObject;

  lat: number = 0;
  long: number = 0;
  watchGps: any;
  photoPriseBase64: any;
  photoPriseBlob: Blob;
  public photoPrise: any;

  constructor(
    platform: Platform, statusBar: StatusBar,
    splashScreen: SplashScreen,
    private barcodeScanner: BarcodeScanner,
    private sqlite: SQLite,
    private geo: Geolocation,
    private backgroudGeolocation: BackgroundGeolocation,
    private camera: Camera,
    public ngZone: NgZone,
    private loading: LoadingController) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });

    this.createDataBase();

  }

  ionViewWillEnter() {
    //this.createDataBase();

  }

  scanCodebar() {
    // objet de configuration passer en parametre à l'oblet barcodeScanner
    this.optionsDeCodebare = {
      preferFrontCamera: false,
      prompt: 'Scanner votre code'
    };

    this.barcodeScanner.scan(this.optionsDeCodebare).then((succesBarcode) => {
      console.log('appel au module du scan ==> ', succesBarcode);
      this.dataFromBarcodeScanner = succesBarcode;
      /*this.addMagasin({
        name: 'test name',
        adresse: 'test adresse',
        codebarCancelled: succesBarcode.cancelled,
        codebarFormat: succesBarcode.format,
        codebarText: succesBarcode.text,
        gpsLatitude: this.lat,
        gpsLongitude: this.long
      });
      this.logError = "scan=" + this.addMagasin.length;*/
    }, (error) => {
      console.log('probleme pour la resource barcodeScanner', error);
      //this.logError = JSON.stringify(error.err);
      this.logError = "scan errer=" + JSON.stringify(error);
    });

  }

  private createDataBase(): void {
    console.warn('debut createDataBase');
    this.sqlite.create({
      name: 'dataScanCodebar.db',
      location: 'default'
    })
      .then((db: SQLiteObject) => {
        this.db = db;
        this.createTables();
        console.log('createDataBase');
      })
      .catch(e => {
        console.log('erreur createDataBase', e);
        this.logError = JSON.stringify(e);
        this.logError = "erreur createDataBase =" + JSON.stringify(e);
      });

  }

  private createTables(): void {
    /* creer la table magasin */
    console.log('createTables ======================');
    this.db.executeSql(`CREATE TABLE IF NOT EXISTS magasin(
                           id INTEGER primary key AUTOINCREMENT , 
                           name TEXT ,
                           adresse TEXT,
                           codebarCancelled TEXT ,
                           codebarFormat TEXT ,
                           codebarText TEXT , 
                           gpsLatitude TEXT ,
                           gpsLongitude TEXT,
                           imageMagasin TEXT  )`, {})
      .then(() => {
        console.log('Executed SQL')
        this.logError = 'creation de la table magasin';
      })
      .catch(e => {
        console.log(e);
        this.logError = 'erreur creation des table' + JSON.stringify(e);
      });
  }

  getAllMagasin(): void {
    console.log('getAllMagasin ======================');
    this.db.executeSql(`select * from magasin`, {})
      .then((result) => {
        console.log('Executed SQL getAllMagasin ', result);
        this.dataFromSqlite.length = 0;
        if (result.rows.length > 0) {
          for (let i: number = 0; result.rows.length; i++) {
            this.dataFromSqlite.push({
              id: result.rows.item(i).id,
              name: result.rows.item(i).name,
              adresse: result.rows.item(i).adresse,
              codebarCancelled: result.rows.item(i).codebarCancelled,
              codebarFormat: result.rows.item(i).codebarFormat,
              codebarText: result.rows.item(i).codebarText,
              gpsLatitude: result.rows.item(i).gpsLatitude,
              gpsLongitude: result.rows.item(i).gpsLongitude
            })
          }
        }

      })
      .catch(e => {
        console.log(e);
        //this.logError = JSON.stringify(e);
        this.logError = "scan error getAllMagasin executeSql" + JSON.stringify(e);
      });

  }
  getAllMagasinAvecImage(): void {
    console.log('getAllMagasinAvecImage ======================');
    this.db.executeSql(`select * from magasin`, {})
      .then((result) => {
        console.log('Executed SQL getAllMagasinAvecImage ', result);
        this.dataFromSqlite.length = 0;
        console.log('result.rows ===>', result.rows);
        if (result.rows.length > 0) {
          for (let i: number = 0; result.rows.length; i++) {
            this.dataFromSqlite.push({
              id: result.rows.item(i).id,
              name: result.rows.item(i).name,
              adresse: result.rows.item(i).adresse,
              codebarCancelled: result.rows.item(i).codebarCancelled,
              codebarFormat: result.rows.item(i).codebarFormat,
              codebarText: result.rows.item(i).codebarText,
              gpsLatitude: result.rows.item(i).gpsLatitude,
              gpsLongitude: result.rows.item(i).gpsLongitude,
              imageMagasin: result.rows.item(i).imageMagasin
            })
          }
        }        
      })
      .catch(e => {
        console.log('scan error getAllMagasinImage executeSql',e);
        //this.logError = JSON.stringify(e);
        this.logError = "scan error getAllMagasinImage executeSql" + JSON.stringify(e);
      });

  }

  deleteMagasin(id: Number): void {
    console.log('deleteMagasin ======================');
    this.sqlite.create({
      name: 'dataScanCodebar.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      db.executeSql(`delete from magasin where id = ?`, [id])
        .then(() => {
          console.log('delete Magasin id = ', id);
          this.getAllMagasinAvecImage();
        })
        .catch(e => console.log(e));

    }).catch(e => {
      console.log(e);
      this.logError = JSON.stringify(e);
    });
  }

  addMagasin(magasin: any): void {
    console.log('addMagasin ======================');
    this.db.executeSql(`insert into magasin(name , adresse , codebarCancelled , codebarFormat , codebarText , gpsLatitude ,gpsLongitude ) 
                         values(?,?,?,?,?,?,?)`,
      [magasin.name,
      magasin.adresse,
      magasin.codebarCancelled,
      magasin.codebarFormat,
      magasin.codebarText,
      magasin.gpsLatitude,
      magasin.gpsLongitude])
      .then(() => {
        console.log('add Magasin  = ', magasin);
        this.getAllMagasin();
        this.logError = "scan  addMagasin sql" + this.addMagasin.length;
      })
      .catch(e => {
        console.log(e);
        this.logError = "scan  error addMagasin sql" + JSON.stringify(e);
      });
  }
  addMagasinAvecImage(magasin: any): void {
    console.log('addMagasinAvecImage ======================');
    this.db.executeSql(`insert into magasin(name , adresse , codebarCancelled , codebarFormat , codebarText , gpsLatitude ,gpsLongitude , imageMagasin ) 
                         values(?,?,?,?,?,?,?,?)`,
      [magasin.name,
      magasin.adresse,
      magasin.codebarCancelled,
      magasin.codebarFormat,
      magasin.codebarText,
      magasin.gpsLatitude,
      magasin.gpsLongitude,
      magasin.imageMagasin])
      .then(() => {
        console.log('add MagasinImage  = ', magasin);
        this.getAllMagasinAvecImage();
        this.logError = "scan  addMagasin sql" + this.addMagasin.length;
      })
      .catch(e => {
        console.log('scan  error addMagasinImage sql',e);
        this.logError = "scan  error addMagasinImage sql" + JSON.stringify(e);
      });
  }

  clearDbMagasin(): void {
    console.log('clearDbMagasin ======================');
    this.db.executeSql(`delete from magasin`, [])
      .then(() => {
        console.log('clearDbMagasin ');
        this.getAllMagasin();
        this.logError = "clearDbMagasin sql" + this.addMagasin.length;

      })
      .catch(e => {
        console.log(e);
        this.logError = " error clearDbMagasin sql" + JSON.stringify(e);
      });
  }


  refresh() {
    console.log('refresh ======================');
    //this.getAllMagasin();
    this.getAllMagasinAvecImage();
  }

  /*---  Fonction de GPS -----*/
  startGps(): void {
    console.log('startGps ======================');
    let config = {
      desiredAccuracy: 0,
      stationaryRadius: 20,
      distanceFilter: 9,
      debug: true,
      interval: 2000
    };

    this.backgroudGeolocation.configure(config).subscribe((location) => {
      console.log('Background running ');
      console.log('location.latitude = ' + location.latitude + ' location.longitude = ' + location.longitude)
      this.ngZone.run(() => {
        this.lat = location.latitude;
        this.long = location.longitude;
      });
    }, (error) => {
      console.log('error backgroudGeolocation', error)
    });

    this.backgroudGeolocation.start();

    let options = {
      frequency: 3000,
      enableHighAccuracy: true

    };

    this.watchGps = this.geo.watchPosition(options)
      .filter((po: any) => po.code === undefined)
      .subscribe((position: Geoposition) => {
        console.log('Geoposition', position);

        this.ngZone.run(() => {
          this.lat = position.coords.latitude;
          this.long = position.coords.longitude;
        });
      });
  }

  stopGps(): void {
    console.log('stopGps ======================');
    this.backgroudGeolocation.finish();
    this.watchGps.unsubscribe();
    console.log('the GPS Stopped ...');
  }

  /*---  Fonction de GPS Finish-----*/

  /*--- Fonction Photo --- */
  onTackPhoto(): void {
    console.log('onTackPhoto ======================');
    /*objet de configuration de camera*/
    const options: CameraOptions = {
      quality: 100,
      targetHeight: 1024,
      targetWidth: 720,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true
    }
    this.camera.getPicture(options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64:

      this.loading.create({
        content: 'Prise de la photo ...'
      });
      //this.loading.present();      
      this.photoPriseBase64 = 'data:image/jpeg;base64,' + imageData;
      //console.log('photoPriseBase64 11-->', this.photoPriseBase64);
      this.photoPriseBlob = this.dataUrlToBlob(this.photoPriseBase64);
      //console.log('dataUrlToBlob 22--> ', this.photoPriseBlob);
      //this.uploadImage();      
      this.dataUrlToBase64(this.photoPriseBlob);


    }, (error) => {
      console.log('error onTackPhoto ==> ', error);
    });
  }

  dataUrlToBlob(myUrl) {
    console.log('dataUrlToBlob ======================');
    let binary = atob(myUrl.split(',')[1]);
    let array = [];
    for (let i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }

    //console.log('dataUrlToBlob traitement -->', array);
    return new Blob([new Uint8Array(array)], { type: 'image/jpeg' });
  }

  uploadImage() {
    if (this.photoPriseBase64) {

    }
  }

  dataUrlToBase64(dataBlob) {
    console.log('dataUrlToBase64 ======================');
    let reader = new FileReader();
    reader.readAsDataURL(dataBlob);

    reader.onload = (e) => {
      var dataUrl = reader.result;
      //console.log('dataUrl --> ',dataUrl);
      var base64 = 'data:image/jpeg;base64,' + dataUrl.split(',')[1];
      this.photoPrise = base64;
      console.log(" photoPrise encoverti en base64 ==> ", this.photoPrise);
    }
    //console.log('readAsDataURL ====> ', 'data:image/jpeg;base64,'+reader.readAsDataURL(dataBlob));
  }


  /*--- Fonction Photo Finish ---- */

  entregistrerTousLesDonnees(): void {
    console.log('entregistrerTousLesDonnees =====================');
    this.addMagasinAvecImage({
      name: 'toto',
      adresse: 'titi',
      codebarCancelled: this.dataFromBarcodeScanner.cancelled,
      codebarFormat: this.dataFromBarcodeScanner.format,
      codebarText: this.dataFromBarcodeScanner.text,
      gpsLatitude: this.lat,
      gpsLongitude: this.long,
      imageMagasin: this.photoPriseBase64
    });    
    /*this.addMagasin({
      name: 'test name',
      adresse: 'test adresse',
      codebarCancelled: 'this.dataFromBarcodeScanner.cancelled',
      codebarFormat: 'this.dataFromBarcodeScanner.format',
      codebarText: 'this.dataFromBarcodeScanner.text',
      gpsLatitude: this.lat,
      gpsLongitude: this.long,
      imageMagasin: this.photoPriseBase64
    });*/
  }

}
