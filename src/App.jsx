import Header from './components/Header'
import UploadSection from './components/UploadSection'
import FileList from './components/FileList'

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <UploadSection />
        <FileList />
      </main>
    </div>
  )
}

export default App
