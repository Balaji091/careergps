import React, { useState, useEffect, useRef } from 'react';
import { Eye, Edit3, Save, Tag, Pin } from 'lucide-react';

const RichTextEditor = ({ initialContent = '', initialTags = [], isPinned = false, onSave, onPinToggle }) => {
  const [content, setContent] = useState(initialContent);
  const [activeTab, setActiveTab] = useState('edit'); // 'edit' or 'preview'
  const [saveStatus, setSaveStatus] = useState('Saved'); // 'Saved', 'Saving...', 'Unsaved'
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState(initialTags);
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    setContent(initialContent);
    setTags(initialTags);
    setSaveStatus('Saved');
  }, [initialContent, initialTags]);

  useEffect(() => {
    if (content === initialContent && JSON.stringify(tags) === JSON.stringify(initialTags)) {
      return;
    }

    setSaveStatus('Saving...');
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await onSave(content, tags);
        setSaveStatus('Saved');
      } catch (err) {
        setSaveStatus('Error saving');
      }
    }, 1200);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [content, tags]);

  const handleManualSave = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    onSave(content, tags);
    setSaveStatus('Saved');
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim() !== '') {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const renderMarkdown = (md) => {
    if (!md) return '<p class="text-gray-400 italic text-xs">No notes written yet. Start typing here to log study insights.</p>';
    
    let html = md
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    html = html.replace(/^### (.*$)/gim, '<h4 class="text-sm font-bold mt-4 mb-1.5 text-gray-900">$1</h4>');
    html = html.replace(/^## (.*$)/gim, '<h3 class="text-base font-bold mt-5 mb-2 text-gray-900 border-b border-gray-100 pb-1">$1</h3>');
    html = html.replace(/^# (.*$)/gim, '<h2 class="text-lg font-bold mt-6 mb-3.5 text-gray-900 border-b border-gray-200 pb-2">$1</h2>');

    html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-slate-50 border border-gray-200 rounded-lg p-3 my-3.5 font-mono text-xs overflow-x-auto text-gray-800">$1</pre>');
    html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-xs text-[#2563EB]">$1</code>');

    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    html = html.replace(/^\s*-\s+(.*$)/gim, '<li class="ml-4 list-disc my-1 text-gray-600">$1</li>');

    html = html.split('\n\n').map(p => {
      if (p.trim().startsWith('<h') || p.trim().startsWith('<pre') || p.trim().startsWith('<li')) {
        return p;
      }
      return `<p class="my-2 leading-relaxed text-gray-600 text-xs sm:text-sm">${p}</p>`;
    }).join('\n');

    return html;
  };

  return (
    <div className="w-full bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden flex flex-col">
      {/* Editor Toolbar (Notion styled, bg-white) */}
      <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-2.5 bg-white shrink-0">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setActiveTab('edit')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'edit' 
                ? 'bg-blue-50/50 text-[#2563EB] border border-blue-100 shadow-sm' 
                : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#F8FAFC]'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Write</span>
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'preview' 
                ? 'bg-blue-50/50 text-[#2563EB] border border-blue-100 shadow-sm' 
                : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#F8FAFC]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>
        </div>

        <div className="flex items-center space-x-3.5">
          <button
            onClick={onPinToggle}
            className={`p-1 rounded-lg transition-colors cursor-pointer ${
              isPinned ? 'text-[#F59E0B] bg-amber-50 border border-amber-100' : 'text-[#6B7280] hover:text-[#111827]'
            }`}
            title={isPinned ? 'Unpin note' : 'Pin note'}
          >
            <Pin className="w-4 h-4 fill-current" />
          </button>
          
          <span className={`text-[10px] font-semibold uppercase tracking-wider ${
            saveStatus === 'Saving...' ? 'text-[#F59E0B]' :
            saveStatus === 'Saved' ? 'text-[#22C55E]' : 'text-[#6B7280]'
          }`}>
            {saveStatus}
          </span>
          
          <button
            onClick={handleManualSave}
            className="flex items-center space-x-1 px-2.5 py-1 text-xs font-bold text-[#6B7280] hover:text-[#111827] bg-white border border-[#E5E7EB] hover:bg-[#F8FAFC] rounded-lg shadow-sm cursor-pointer transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="p-4 flex-1">
        {activeTab === 'edit' ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="# Title (H1)&#10;## Subheading (H2)&#10;- Bullet list item&#10;`code` inline block&#10;```&#10;// Code block code&#10;```"
            className="w-full min-h-[350px] outline-none resize-none font-mono text-xs leading-relaxed border-0 focus:ring-0 text-[#111827]"
          />
        ) : (
          <div
            className="prose prose-sm max-w-none min-h-[350px] overflow-y-auto"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
          />
        )}
      </div>

      {/* Tag management footer */}
      <div className="border-t border-[#E5E7EB] p-3 flex flex-wrap items-center bg-[#F8FAFC] gap-2 shrink-0">
        <div className="flex items-center space-x-1.5 text-xs text-[#6B7280] mr-2">
          <Tag className="w-3.5 h-3.5" />
          <span>Tags:</span>
        </div>
        
        {tags.map((tag) => (
          <span key={tag} className="inline-flex items-center bg-blue-50 border border-blue-100 text-[10px] font-bold px-2 py-0.5 rounded-full text-[#2563EB]">
            <span>{tag}</span>
            <button
              onClick={() => handleRemoveTag(tag)}
              className="ml-1 hover:text-[#EF4444] text-blue-300 font-bold cursor-pointer"
            >
              &times;
            </button>
          </span>
        ))}
        
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleAddTag}
          placeholder="Press Enter to add tag"
          className="border-0 bg-transparent text-xs p-1 outline-none focus:ring-0 min-w-[150px] text-[#111827]"
        />
      </div>
    </div>
  );
};

export default RichTextEditor;
