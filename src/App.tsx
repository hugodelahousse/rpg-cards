import { Routes, Route } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { TemplateLibraryPage } from './pages/TemplateLibraryPage'
import { EditorPage } from './pages/EditorPage'
import { CharacterPage } from './pages/CharacterPage'

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/character" element={<CharacterPage />} />
      <Route path="/editor" element={<TemplateLibraryPage />} />
      <Route path="/editor/new" element={<EditorPage />} />
      <Route path="/editor/:templateId" element={<EditorPage />} />
    </Routes>
  )
}
