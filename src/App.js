import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/storage';
import 'firebase/compat/database';
import 'firebase/compat/auth';
import 'bootstrap/dist/css/bootstrap.min.css';
import firebaseLogo from "./react-native-firebase-1-logo-png-transparent.png"

const firebaseConfig = {

  apiKey: "Votre_clé_API",
  authDomain: "uploadimg-9503e.firebaseapp.com",
  databaseURL: "https://uploadimg-9503e-default-rtdb.firebaseio.com",
  projectId: "uploadimg-9503e",
  storageBucket: "uploadimg-9503e.appspot.com",
  messagingSenderId: "205671772867",
  appId: "1:205671772867:web:11815843ce16586923e876"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const App = () => {
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [pictures, setPictures] = useState([]);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged(user => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });
    fetchPicturesFromFirebase();
    return () => unsubscribe();
  }, []);

  const fetchPicturesFromFirebase = async () => {
    const picturesRef = firebase.database().ref('pictures');
    try {
      const snapshot = await picturesRef.once('value');
      const picturesData = snapshot.val();
      const picturesArray = [];
      for (let key in picturesData) {
        picturesArray.push({ id: key, ...picturesData[key] });
      }
      setPictures(picturesArray);
    } catch (error) {
      console.error("Erreur lors de la récupération des images :", error);
    }
  };

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
      .catch(error => setError(error.message));
  };

  const signOut = () => {
    firebase.auth().signOut();
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = () => {
    if (file) {
      const storageRef = firebase.storage().ref();
      const fileRef = storageRef.child(file.name);
      fileRef.put(file).then(() => {
        alert("Fichier téléchargé avec succès !");
        fileRef.getDownloadURL().then(url => {
          setImageUrl(url);
          firebase.database().ref('pictures').push({
            imageUrl: url,
            name: name,
            price: price,
            quantity: quantity
          }).then(() => {
            fetchPicturesFromFirebase();
          });
        });
      }).catch(error => {
        console.error("Erreur lors du téléchargement du fichier :", error);
      });
    } else {
      alert("Aucun fichier sélectionné !");
    }
  };

  const handleDelete = (id) => {
    firebase.database().ref(`pictures/${id}`).remove().then(() => {
      fetchPicturesFromFirebase();
    });
  };

  const handleModify = (id, product) => {
    setName(product.name);
    setPrice(product.price);
    setQuantity(product.quantity);
    setSelectedProduct(product);
  };

  const saveModifiedProduct = () => {
    if (selectedProduct) {
      firebase.database().ref(`pictures/${selectedProduct.id}`).update({
        name: name,
        price: price,
        quantity: quantity
      }).then(() => {
        fetchPicturesFromFirebase();
        setName('');
        setPrice('');
        setQuantity('');
        setSelectedProduct(null);
      });
    }
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">
            <img src={firebaseLogo} alt="Logo Firebase" style={{ maxWidth: '100px' , height :"50px" }} />
          </a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
            <ul className="navbar-nav">
              {user ? (
                <li className="nav-item">
                  <button onClick={signOut} className="btn btn-danger">Déconnexion</button>
                </li>
              ) : (""

              )}
            </ul>
          </div>
        </div>
      </nav>
      <div className="container mt-5">
        <h2 className="text-center mb-4">Télécharger un fichier sur Firebase Storage</h2>
        {user ? (
          <div>
            <div className="mb-3">
              <input type="file" onChange={handleFileChange} className="form-control" />
            </div>
            <div className="mb-3">
              <input type="text" placeholder="Nom" value={name} onChange={(e) => setName(e.target.value)} className="form-control" />
            </div>
            <div className="mb-3">
              <input type="text" placeholder="Prix" value={price} onChange={(e) => setPrice(e.target.value)} className="form-control" />
            </div>
            <div className="mb-3">
              <input type="text" placeholder="Quantité" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="form-control" />
            </div>
            <div className="mb-3">
              <button onClick={handleUpload} className="btn btn-primary">Télécharger</button>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Nom</th>
                  <th>Prix</th>
                  <th>Quantité</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pictures.map(picture => (
                  <tr key={picture.id}>
                    <td><img src={picture.imageUrl} alt="Téléchargé" style={{ maxWidth: '100px' }} /></td>
                    <td>{picture.name}</td>
                    <td>{picture.price}</td>
                    <td>{picture.quantity}</td>
                    <td>
                      <button onClick={() => handleDelete(picture.id)} className="btn btn-danger me-2">Supprimer</button>
                      <button onClick={() => handleModify(picture.id, picture)} className="btn btn-success">Modifier</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {selectedProduct && (
              <button onClick={saveModifiedProduct} className="btn btn-primary">Enregistrer le produit modifié</button>
            )}
          </div>
        ) : (
          <div className="login-container text-center">
            <h3 className="mb-4">Connexion</h3>
            <p>Connectez-vous avec Google :</p>
            <button onClick={signInWithGoogle} className="btn btn-primary">Connexion avec Google</button>
            {error && <p className="text-danger mt-3">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
