import React, { useState } from 'react';
import { FileText, Folder, Upload, Search, Download, Clock, MoreVertical, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

function Documents() {
  const { documents, addDocument, controls, linkDocumentToControl } = useAppContext();
  const [activeFolder, setActiveFolder] = useState('Todas las carpetas');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [linkingDoc, setLinkingDoc] = useState(null); // Document currently being linked to a control
  const [newDoc, setNewDoc] = useState({ name: '', type: 'Evidence', folder: 'Evidencias 2026', size: '1.0 MB', author: 'Usuario' });

  // Dynamically compute folders from existing documents
  const folders = ['Todas las carpetas', ...new Set(documents.map(d => d.folder))];
  
  const filteredDocs = documents.filter(doc => {
    const matchesFolder = activeFolder === 'Todas las carpetas' || doc.folder === activeFolder;
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || doc.author.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  return (
    <div className="animate-fade-in stagger-2">
      <div className="page-header">
        <div>
          <h1 className="page-title">Repositorio Documental</h1>
          <p className="page-subtitle">Gestión centralizada de políticas, procedimientos y evidencias (Control de Versiones)</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowUploadModal(true)}>
          <Upload className="w-5 h-5 inline mr-2" />
          Subir Documento
        </button>
      </div>

      {showUploadModal && (
        <div className="card mb-8 border border-[var(--brand-primary)]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Subir Nuevo Documento</h3>
            <button className="icon-button" onClick={() => setShowUploadModal(false)}><X className="w-5 h-5"/></button>
          </div>
          <div className="grid-2">
            <div className="form-group col-span-2">
              <label className="form-label">Nombre del Archivo (Ej. Activo_Fijos.pdf)</label>
              <input type="text" className="form-control" value={newDoc.name} onChange={e => setNewDoc({...newDoc, name: e.target.value})} />
            </div>
            <div className="form-group">
               <label className="form-label">Carpeta / Categoría</label>
               <input type="text" className="form-control" value={newDoc.folder} onChange={e => setNewDoc({...newDoc, folder: e.target.value})} />
            </div>
             <div className="form-group">
               <label className="form-label">Tipo (Policy, Record, Evidence, etc.)</label>
               <input type="text" className="form-control" value={newDoc.type} onChange={e => setNewDoc({...newDoc, type: e.target.value})} />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
             <button className="btn btn-primary" onClick={() => {
               if(newDoc.name) {
                 addDocument(newDoc);
                 setShowUploadModal(false);
                 setNewDoc({ name: '', type: 'Evidence', folder: 'Evidencias 2026', size: '1.0 MB', author: 'Usuario' });
               }
             }}>Guardar en Repositorio</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="card p-4">
            <h3 className="font-bold mb-4 text-[var(--text-secondary)] uppercase text-xs tracking-wider">Estructura</h3>
            <ul className="space-y-2">
              {folders.map(folder => {
                const count = folder === 'Todas las carpetas' ? documents.length : documents.filter(d => d.folder === folder).length;
                const isActive = activeFolder === folder;
                return (
                  <li key={folder} 
                      onClick={() => setActiveFolder(folder)}
                      className={`flex justify-between items-center gap-2 text-sm p-2 rounded-md cursor-pointer transition-colors ${isActive ? 'bg-[var(--bg-tertiary)] text-[var(--brand-primary)] font-medium' : 'hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'}`}>
                    <div className="flex items-center gap-2">
                      <Folder className={`w-4 h-4 ${isActive ? 'fill-current opacity-20' : ''}`} /> 
                      <span className="truncate max-w-[150px]">{folder}</span>
                    </div>
                    <span className="badge badge-neutral text-xs">{count}</span>
                  </li>
                );
              })}
            </ul>
          </div>
          
          <div className="card p-4 bg-gradient-to-br from-[var(--bg-tertiary)] to-[var(--bg-secondary)]">
             <div className="flex items-center gap-3 text-[var(--brand-warning)] mb-2">
               <Clock className="w-5 h-5" />
               <h3 className="font-bold text-sm">Revisiones Pendientes</h3>
             </div>
             <p className="text-xs text-[var(--text-muted)] mb-4">2 documentos requieren revisión anual según ISO 27001 (A.5.1).</p>
             <button className="btn btn-outline text-xs py-1 px-3 w-full">Ver Pendientes</button>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="card mb-4 p-4 flex gap-4 bg-[var(--bg-secondary)]">
            <div className="header-search flex-1 w-full relative">
              <Search className="search-icon absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input type="text" 
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-[var(--brand-primary)]" 
                     placeholder="Buscar documento por nombre, autor o contenido..." />
            </div>
            <select className="form-control max-w-[150px] py-2 text-sm">
              <option>Más recientes</option>
              <option>Alfabético (A-Z)</option>
              <option>Mayor tamaño</option>
            </select>
          </div>

          <div className="card table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre del Archivo</th>
                  <th>Tipo</th>
                  <th>Autor</th>
                  <th>Última Modificación</th>
                  <th>Tamaño</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredDocs.map(doc => (
                  <tr key={doc.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[rgba(16,185,129,0.1)] rounded-md text-[var(--brand-primary)]">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-[var(--text-primary)] line-clamp-1" title={doc.name}>{doc.name}</span>
                          <span className="text-xs text-[var(--text-muted)] lg:hidden">{doc.folder}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-neutral bg-[var(--bg-tertiary)]">{doc.type}</span>
                    </td>
                    <td className="text-sm text-[var(--text-secondary)]">{doc.author}</td>
                    <td className="text-sm">{doc.date}</td>
                    <td className="text-sm text-[var(--text-muted)]">{doc.size}</td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                         <button 
                           onClick={() => setLinkingDoc(doc)}
                           className={`icon-button w-8 h-8 ${doc.linkedControl ? 'text-[var(--brand-success)]' : 'hover:text-[var(--brand-primary)]'}`} 
                           title={doc.linkedControl ? `Vinculado a ${doc.linkedControl}` : "Vincular a Control ISO"}
                         >
                           <CheckCircle className="w-4 h-4" />
                         </button>
                         <button className="icon-button w-8 h-8 hover:text-[var(--brand-primary)]" title="Descargar">
                           <Download className="w-4 h-4" />
                         </button>
                         <button className="icon-button w-8 h-8" title="Opciones">
                           <MoreVertical className="w-4 h-4" />
                         </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* VDR Linker Modal */}
      {linkingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="card w-full max-w-lg shadow-2xl border border-[var(--brand-primary)]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <FileText className="text-[var(--brand-primary)]" />
                Vincular Evidencia a Control
              </h3>
              <button className="icon-button" onClick={() => setLinkingDoc(null)}><X className="w-5 h-5"/></button>
            </div>
            
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Seleccione el control de la ISO 27001 que se respalda con el archivo: <br/>
              <strong className="text-[var(--text-primary)]">{linkingDoc.name}</strong>
            </p>

            <div className="max-h-[300px] overflow-y-auto border rounded-lg mb-6 bg-[var(--bg-primary)]">
               {controls.filter(c => c.norm === 'ISO 27001').map(ctrl => (
                 <div 
                   key={ctrl.id} 
                   onClick={() => {
                     linkDocumentToControl(linkingDoc.id, ctrl.id);
                     setLinkingDoc(null);
                   }}
                   className="p-3 border-b last:border-0 hover:bg-[var(--bg-tertiary)] cursor-pointer transition-colors flex justify-between items-center"
                 >
                   <div>
                     <span className="font-mono text-xs font-bold text-[var(--brand-primary)] mr-2">{ctrl.id}</span>
                     <span className="text-sm">{ctrl.name}</span>
                   </div>
                   {linkingDoc.linkedControl === ctrl.id && <CheckCircle className="w-4 h-4 text-[var(--brand-success)]" />}
                 </div>
               ))}
            </div>

            <div className="flex justify-end italic text-[10px] text-[var(--text-muted)]">
              * Vincular un documento marcará el control como "Auditado" automáticamente.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Documents;
