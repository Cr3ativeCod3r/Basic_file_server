import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './style.css';

function App() {
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    axios.get('https://kamil-banaszek.pl/files')
      .then(response => {
        const sortedFiles = response.data.files.sort((a, b) => {
          const dateA = new Date(a.addedAt).getTime();
          const dateB = new Date(b.addedAt).getTime();
          return dateB - dateA;
        });

        setFiles(sortedFiles);
      })
      .catch(error => console.error('Error fetching files:', error));
  }, []);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleFileUpload = () => {
    const formData = new FormData();
    formData.append('file', file);

    axios.post('https://kamil-banaszek.pl/upload', formData)
      .then(response => {
        axios.get('https://kamil-banaszek.pl/files')
          .then(response => setFiles(response.data.files))
          .catch(error => console.error('Error fetching files:', error));

        setFiles([...files, { name: file.name, addedAt: new Date().toISOString() }]);
      })
      .catch(error => console.error('Error uploading file:', error));
  };

  const handleFileDownload = (fileName) => {
    axios.get(`https://kamil-banaszek.pl/uploads/${fileName}`, { responseType: 'blob' })
      .then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
      })
      .catch(error => console.error('Error downloading file:', error));
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    const formattedDate = `(${date.toLocaleDateString()})`;
    const formattedTime = date.toLocaleTimeString();
    return ` ${formattedTime} ${formattedDate}`;
  };

  const filteredFiles = files
    .filter(file => file.name && file.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div id="all">
      <div id="con">
        <h1>Files_Kamiles</h1>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleFileUpload}>Upload</button>(max 5mb)
        <h2>Szukaj pliku:</h2>
        <input type="text" placeholder="Search files..." onChange={handleSearch} />
        <ul>
          {filteredFiles.map((file, index) => (
            <li key={index}>
              <div>
                <button onClick={() => handleFileDownload(file.name)}>{file.name}</button>
                <span> - {formatDateTime(file.addedAt)}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
