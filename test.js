import fs, { read } from 'fs-extra'
import pkg from 'natural';
// import my_trained_data from './trained_data.json' assert {type: 'json'};

const { TfIdf } = pkg;

const readFile = async()=>{
  const filePath = './data.json';
  let data_array = []
  fs.readFile(filePath, 'utf8', (error, data) => {
    if (error) {
      console.error('Error:', error);
      return;
    }
  
    data_array = JSON.parse(data);
    // Access and use the loaded JSON data
    console.log("read function");
    const docVector = createVectorsFromDocs(data_array)
    const t_data = calcSimilarities(docVector)
    // console.log(">>>>", t_data)
    // Convert the object to a JSON string
    const jsonString = JSON.stringify(t_data);

    // // Save the JSON string to a file
    fs.writeFileSync('trained_data.json', jsonString);
    // ====================================================
    // let recoooo =getSimilarDocuments("64aa271d18d555d5d3d8ee4b", t_data)
    // recoooo.forEach(r =>{
    // console.log(r)
    // })
  });
  return data_array
}

class Vector {
  constructor(vector) {
    this.vector = vector;
  }

  dotProduct(vector) {
    // console.log(this.vector,"--", vector.vector)
    let result = 0;
    Object.keys(this.vector).forEach(key => {
      if (vector.vector.hasOwnProperty(key))
      result += this.vector[key] * vector.vector[key];
      else{
        result +=0
      }
    });
    // console.log(result)
    return result;
  }

  getLength() {
    let length = 0;
    Object.keys(this.vector).forEach(key => {
      length += this.vector[key] * this.vector[key];
    });
    return Math.sqrt(length);
  }

  getCosineSimilarity(vector){
    return this.dotProduct(vector) / (this.getLength() * vector.getLength());
  }
}

/**
* Generates the TF-IDF of each term in the document
* Create a Vector with the term as the key and the TF-IDF as the value
**/
const createVectorsFromDocs = (processedDocs) => {
    console.log('vectorizer function')
    const tfidf = new TfIdf();
  
    processedDocs.forEach(processedDocument => {
      tfidf.addDocument(processedDocument.description);
    });
  
    const documentVectors = [];
  
    for (let i = 0; i < processedDocs.length; i += 1) {
      const processedDocument = processedDocs[i];
      const obj = {};
      const items = tfidf.listTerms(i);
      for (let j = 0; j < items.length; j += 1) {
        const item = items[j];
        obj[item.term] = item.tfidf;
      }
      const documentVector = {
        id: processedDocument._id,
        vector : new Vector(obj)
      };
  
      documentVectors.push(documentVector);
    }
  return documentVectors
}

/**
* Calculates the similarities between 2 vectors
* getCosineSimilarity creates the dotproduct and the 
* length of the 2 vectors to calculate the cosine 
* similarity
*/


const calcSimilarities = (docVectors) => {
  // console.log("=cs==>", docVectors.length)
  // number of results that you want to return.
  const MAX_SIMILAR = 20; 
  // min cosine similarity score that should be returned.
  const MIN_SCORE = 0.2;
  const data = {};

  for (let i = 0; i < docVectors.length; i += 1) {
    const documentVector = docVectors[i];
    const { id } = documentVector;
    data[id] = [];
  }
  for (let i = 0; i < docVectors.length; i += 1) {
    for (let j = 0; j < i; j += 1) {
      const idi = docVectors[i].id;
      const vi = docVectors[i].vector;
      const idj = docVectors[j].id;
      const vj = docVectors[j].vector;
      const similarity = vi.getCosineSimilarity(vj);
      // console.log(similarity)
      if (similarity > MIN_SCORE) {
        data[idi].push({ id: idj, score: similarity });
        data[idj].push({ id: idi, score: similarity });
      }
    }
  }

  // finally sort the similar documents by descending order
  Object.keys(data).forEach(id => {
    data[id].sort((a, b) => b.score - a.score);

    if (data[id].length > MAX_SIMILAR) {
      data[id] = data[id].slice(0, MAX_SIMILAR);
    }
  });

  return data;
}


const getSimilarDocuments = (id, trainedData) => {
  let similarDocuments = trainedData[id];

  if (similarDocuments === undefined) {
    return [];
  }

  return similarDocuments;
};


// const datA = await readFile()

console.log('hello')
const trained_data = JSON.parse(fs.readFileSync('trained_data.json', 'utf8'));
// const data = JSON.parse(fs.readFileSync('./data.json', 'utf8'));
console.log(trained_data)
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
console.log('sunshine')