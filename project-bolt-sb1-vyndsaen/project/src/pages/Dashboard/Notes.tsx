import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, Star, Archive, Tag, Grid, List, Edit3, Trash2, Copy } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useApp } from '../../context/AppContext';
import { Note } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Modal from '../../components/UI/Modal';
import RichTextEditor from '../../components/UI/RichTextEditor';

const Notes: React.FC = () => {
  const { notes, addNote, updateNote, deleteNote } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | string>('all');
  const [filterType, setFilterType] = useState<'all' | Note['type']>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'text' as Note['type'],
    category: '',
    tags: [] as string[]
  });
  
  const [newTag, setNewTag] = useState('');

  // Get unique categories from existing notes
  const categories = useMemo(() => {
    const cats = new Set(notes.map(note => note.category).filter(Boolean));
    return Array.from(cats);
  }, [notes]);

  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = filterCategory === 'all' || note.category === filterCategory;
      const matchesType = filterType === 'all' || note.type === filterType;
      const matchesArchived = showArchived ? note.isArchived : !note.isArchived;
      const matchesFavorites = showFavorites ? note.isFavorite : true;
      
      return matchesSearch && matchesCategory && matchesType && matchesArchived && matchesFavorites;
    }).sort((a, b) => {
      // Sort by favorites first, then by updated date
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [notes, searchTerm, filterCategory, filterType, showArchived, showFavorites]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingNote) {
      updateNote(editingNote.id, {
        ...formData,
        updatedAt: new Date().toISOString()
      });
    } else {
      addNote({
        ...formData,
        isFavorite: false,
        isArchived: false,
        attachments: [],
        collaborators: [],
        version: 1
      });
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      type: 'text',
      category: '',
      tags: []
    });
    setEditingNote(null);
    setIsModalOpen(false);
    setNewTag('');
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      type: note.type,
      category: note.category,
      tags: note.tags
    });
    setIsModalOpen(true);
  };

  const toggleFavorite = (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      updateNote(noteId, {
        isFavorite: !note.isFavorite,
        updatedAt: new Date().toISOString()
      });
    }
  };

  const toggleArchive = (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      updateNote(noteId, {
        isArchived: !note.isArchived,
        updatedAt: new Date().toISOString()
      });
    }
  };

  const duplicateNote = (note: Note) => {
    addNote({
      title: `${note.title} (Copy)`,
      content: note.content,
      type: note.type,
      category: note.category,
      tags: note.tags,
      isFavorite: false,
      isArchived: false,
      attachments: [],
      collaborators: [],
      version: 1
    });
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const getTypeIcon = (type: Note['type']) => {
    switch (type) {
      case 'text': return <Edit3 className="h-4 w-4" />;
      case 'checklist': return <List className="h-4 w-4" />;
      case 'canvas': return <Grid className="h-4 w-4" />;
      case 'template': return <Copy className="h-4 w-4" />;
      default: return <Edit3 className="h-4 w-4" />;
    }
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    const textContent = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
    return textContent.length > maxLength 
      ? textContent.substring(0, maxLength) + '...' 
      : textContent;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Notes</h1>
          <p className="text-gray-400 mt-2">
            Capture ideas, create checklists, and organize your thoughts.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex bg-gray-700 rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Note
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <Edit3 className="h-8 w-8 text-blue-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Total Notes</p>
              <div className="text-2xl font-bold text-gray-100">{notes.length}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Star className="h-8 w-8 text-yellow-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Favorites</p>
              <div className="text-2xl font-bold text-gray-100">
                {notes.filter(n => n.isFavorite).length}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Archive className="h-8 w-8 text-gray-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Archived</p>
              <div className="text-2xl font-bold text-gray-100">
                {notes.filter(n => n.isArchived).length}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Tag className="h-8 w-8 text-green-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Categories</p>
              <div className="text-2xl font-bold text-gray-100">{categories.length}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search notes, tags, or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-100"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-100"
              >
                <option value="all">All Types</option>
                <option value="text">Text</option>
                <option value="checklist">Checklist</option>
                <option value="canvas">Canvas</option>
                <option value="template">Template</option>
              </select>
              <label className="flex items-center space-x-2 text-gray-300">
                <input
                  type="checkbox"
                  checked={showFavorites}
                  onChange={(e) => setShowFavorites(e.target.checked)}
                  className="rounded border-gray-600 bg-gray-800 text-yellow-600 focus:ring-yellow-500"
                />
                <span className="text-sm">Favorites only</span>
              </label>
              <label className="flex items-center space-x-2 text-gray-300">
                <input
                  type="checkbox"
                  checked={showArchived}
                  onChange={(e) => setShowArchived(e.target.checked)}
                  className="rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">Show archived</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes Grid/List */}
      {filteredNotes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Edit3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No notes found. Create your first note!</p>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
          : 'space-y-4'
        }>
          {filteredNotes.map((note) => (
            <Card 
              key={note.id} 
              className={`cursor-pointer hover:bg-gray-700/50 transition-colors ${
                note.isFavorite ? 'border-yellow-500/50' : ''
              } ${note.isArchived ? 'opacity-60' : ''}`}
              onClick={() => handleEdit(note)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    {getTypeIcon(note.type)}
                    <CardTitle className="truncate text-base">{note.title}</CardTitle>
                    {note.isFavorite && (
                      <Star className="h-4 w-4 text-yellow-400 fill-current flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFavorite(note.id)}
                      className="p-1"
                    >
                      <Star className={`h-4 w-4 ${note.isFavorite ? 'text-yellow-400 fill-current' : 'text-gray-400'}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => duplicateNote(note)}
                      className="p-1"
                    >
                      <Copy className="h-4 w-4 text-gray-400" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleArchive(note.id)}
                      className="p-1"
                    >
                      <Archive className={`h-4 w-4 ${note.isArchived ? 'text-blue-400' : 'text-gray-400'}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteNote(note.id)}
                      className="p-1 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {note.content && (
                    <p className="text-sm text-gray-300 line-clamp-3">
                      {truncateContent(note.content)}
                    </p>
                  )}
                  
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {note.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-gray-700 text-gray-300 rounded-full text-xs flex items-center">
                          <Tag className="h-2 w-2 mr-1" />
                          {tag}
                        </span>
                      ))}
                      {note.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded-full text-xs">
                          +{note.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{note.category || 'Uncategorized'}</span>
                    <span>Updated {format(parseISO(note.updatedAt), 'MMM dd, yyyy')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Note Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={resetForm}
        title={editingNote ? 'Edit Note' : 'New Note'}
      >
        <div className="max-h-96 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="Enter note title"
            />
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-300">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as Note['type'] })}
                  className="block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="text">Text Note</option>
                  <option value="checklist">Checklist</option>
                  <option value="canvas">Canvas</option>
                  <option value="template">Template</option>
                </select>
              </div>
              
              <Input
                label="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Work, Personal"
                list="categories"
              />
              <datalist id="categories">
                {categories.map(category => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </div>
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-300">Content</label>
              <RichTextEditor
                value={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
                placeholder="Start writing your note..."
                className="min-h-[200px]"
              />
            </div>
            
            {/* Tags */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Tags</label>
              <div className="flex space-x-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} size="sm">
                  Add
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-700 text-gray-300 rounded-full text-xs flex items-center"
                    >
                      <Tag className="h-2 w-2 mr-1" />
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-gray-400 hover:text-red-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit">
                {editingNote ? 'Update Note' : 'Create Note'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default Notes;