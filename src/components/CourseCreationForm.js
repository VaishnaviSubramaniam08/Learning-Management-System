import React, { useState } from 'react';
import axios from '../api';

const CourseCreationForm = () => {
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    overview: '',
    learningOutcomes: [''],
    category: '',
    level: 'beginner',
    duration: '',
    price: 0,
    modules: []
  });

  const [currentModule, setCurrentModule] = useState({
    title: '',
    description: '',
    content: '',
    detailedContent: {
      explanations: [{ title: '', content: '', examples: [''] }],
      keyPoints: [''],
      summary: ''
    },
    learningObjectives: [''],
    duration: 0,
    videoUrl: '',
    order: 1
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleCourseChange = (e) => {
    const { name, value } = e.target;
    setCourseData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLearningOutcomeChange = (index, value) => {
    const newOutcomes = [...courseData.learningOutcomes];
    newOutcomes[index] = value;
    setCourseData(prev => ({
      ...prev,
      learningOutcomes: newOutcomes
    }));
  };

  const addLearningOutcome = () => {
    setCourseData(prev => ({
      ...prev,
      learningOutcomes: [...prev.learningOutcomes, '']
    }));
  };

  const removeLearningOutcome = (index) => {
    const newOutcomes = courseData.learningOutcomes.filter((_, i) => i !== index);
    setCourseData(prev => ({
      ...prev,
      learningOutcomes: newOutcomes
    }));
  };

  const handleModuleChange = (e) => {
    const { name, value } = e.target;
    setCurrentModule(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDetailedContentChange = (field, value) => {
    setCurrentModule(prev => ({
      ...prev,
      detailedContent: {
        ...prev.detailedContent,
        [field]: value
      }
    }));
  };

  const handleExplanationChange = (index, field, value) => {
    const newExplanations = [...currentModule.detailedContent.explanations];
    newExplanations[index] = {
      ...newExplanations[index],
      [field]: value
    };
    setCurrentModule(prev => ({
      ...prev,
      detailedContent: {
        ...prev.detailedContent,
        explanations: newExplanations
      }
    }));
  };

  const addExplanation = () => {
    setCurrentModule(prev => ({
      ...prev,
      detailedContent: {
        ...prev.detailedContent,
        explanations: [...prev.detailedContent.explanations, { title: '', content: '', examples: [''] }]
      }
    }));
  };

  const handleExampleChange = (explanationIndex, exampleIndex, value) => {
    const newExplanations = [...currentModule.detailedContent.explanations];
    newExplanations[explanationIndex].examples[exampleIndex] = value;
    setCurrentModule(prev => ({
      ...prev,
      detailedContent: {
        ...prev.detailedContent,
        explanations: newExplanations
      }
    }));
  };

  const addExample = (explanationIndex) => {
    const newExplanations = [...currentModule.detailedContent.explanations];
    newExplanations[explanationIndex].examples.push('');
    setCurrentModule(prev => ({
      ...prev,
      detailedContent: {
        ...prev.detailedContent,
        explanations: newExplanations
      }
    }));
  };

  const handleKeyPointChange = (index, value) => {
    const newKeyPoints = [...currentModule.detailedContent.keyPoints];
    newKeyPoints[index] = value;
    setCurrentModule(prev => ({
      ...prev,
      detailedContent: {
        ...prev.detailedContent,
        keyPoints: newKeyPoints
      }
    }));
  };

  const addKeyPoint = () => {
    setCurrentModule(prev => ({
      ...prev,
      detailedContent: {
        ...prev.detailedContent,
        keyPoints: [...prev.detailedContent.keyPoints, '']
      }
    }));
  };

  const handleLearningObjectiveChange = (index, value) => {
    const newObjectives = [...currentModule.learningObjectives];
    newObjectives[index] = value;
    setCurrentModule(prev => ({
      ...prev,
      learningObjectives: newObjectives
    }));
  };

  const addLearningObjective = () => {
    setCurrentModule(prev => ({
      ...prev,
      learningObjectives: [...prev.learningObjectives, '']
    }));
  };

  const addModule = () => {
    if (!currentModule.title || !currentModule.description || !currentModule.content) {
      setMessage('Please fill in all required module fields');
      return;
    }

    const moduleToAdd = {
      ...currentModule,
      order: courseData.modules.length + 1
    };

    setCourseData(prev => ({
      ...prev,
      modules: [...prev.modules, moduleToAdd]
    }));

    // Reset current module
    setCurrentModule({
      title: '',
      description: '',
      content: '',
      detailedContent: {
        explanations: [{ title: '', content: '', examples: [''] }],
        keyPoints: [''],
        summary: ''
      },
      learningObjectives: [''],
      duration: 0,
      videoUrl: '',
      order: courseData.modules.length + 2
    });

    setMessage('Module added successfully!');
  };

  const removeModule = (index) => {
    const newModules = courseData.modules.filter((_, i) => i !== index);
    setCourseData(prev => ({
      ...prev,
      modules: newModules
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Validate required fields
      if (!courseData.title || !courseData.description || !courseData.overview || 
          courseData.learningOutcomes.length === 0 || courseData.learningOutcomes[0] === '' ||
          !courseData.category || !courseData.duration || courseData.modules.length < 5) {
        setMessage('Please fill in all required fields and add at least 5 modules');
        setLoading(false);
        return;
      }

      const response = await axios.post('/courses', courseData);
      setMessage('Course created successfully!');
      console.log('Course created:', response.data);
      
      // Reset form
      setCourseData({
        title: '',
        description: '',
        overview: '',
        learningOutcomes: [''],
        category: '',
        level: 'beginner',
        duration: '',
        price: 0,
        modules: []
      });
    } catch (error) {
      setMessage('Error creating course: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h2>Create New Course</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Course Basic Information */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Course Information</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label>Title *</label>
              <input
                type="text"
                name="title"
                value={courseData.title}
                onChange={handleCourseChange}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                required
              />
            </div>
            
            <div>
              <label>Category *</label>
              <select
                name="category"
                value={courseData.category}
                onChange={handleCourseChange}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                required
              >
                <option value="">Select Category</option>
                <option value="programming">Programming</option>
                <option value="design">Design</option>
                <option value="business">Business</option>
                <option value="marketing">Marketing</option>
                <option value="science">Science</option>
                <option value="mathematics">Mathematics</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>Description *</label>
            <textarea
              name="description"
              value={courseData.description}
              onChange={handleCourseChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '80px' }}
              placeholder="Brief description of the course"
              required
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>Course Overview *</label>
            <textarea
              name="overview"
              value={courseData.overview}
              onChange={handleCourseChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '100px' }}
              placeholder="Detailed overview of what students will learn"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label>Level</label>
              <select
                name="level"
                value={courseData.level}
                onChange={handleCourseChange}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            
            <div>
              <label>Duration (hours) *</label>
              <input
                type="number"
                name="duration"
                value={courseData.duration}
                onChange={handleCourseChange}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                min="1"
                required
              />
            </div>
            
            <div>
              <label>Price</label>
              <input
                type="number"
                name="price"
                value={courseData.price}
                onChange={handleCourseChange}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Learning Outcomes */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Learning Outcomes *</h3>
          <p style={{ color: '#666', marginBottom: '15px' }}>What will students learn from this course?</p>
          
          {courseData.learningOutcomes.map((outcome, index) => (
            <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input
                type="text"
                value={outcome}
                onChange={(e) => handleLearningOutcomeChange(index, e.target.value)}
                style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                placeholder={`Learning outcome ${index + 1}`}
                required
              />
              {courseData.learningOutcomes.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeLearningOutcome(index)}
                  style={{ padding: '8px 12px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          
          <button
            type="button"
            onClick={addLearningOutcome}
            style={{ padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            + Add Learning Outcome
          </button>
        </div>

        {/* Module Creation */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Module Creation</h3>
          <p style={{ color: '#666', marginBottom: '15px' }}>Create at least 5 modules for your course</p>
          
          <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '4px', marginBottom: '20px' }}>
            <h4>Add New Module</h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label>Module Title *</label>
                <input
                  type="text"
                  name="title"
                  value={currentModule.title}
                  onChange={handleModuleChange}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  placeholder="e.g., Introduction to Variables"
                />
              </div>
              
              <div>
                <label>Duration (minutes)</label>
                <input
                  type="number"
                  name="duration"
                  value={currentModule.duration}
                  onChange={handleModuleChange}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  min="0"
                />
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label>Description *</label>
              <textarea
                name="description"
                value={currentModule.description}
                onChange={handleModuleChange}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '60px' }}
                placeholder="Brief description of what this module covers"
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label>Content *</label>
              <textarea
                name="content"
                value={currentModule.content}
                onChange={handleModuleChange}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '100px' }}
                placeholder="Main content of the module"
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label>Video URL (optional)</label>
              <input
                type="url"
                name="videoUrl"
                value={currentModule.videoUrl}
                onChange={handleModuleChange}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                placeholder="https://example.com/video.mp4"
              />
            </div>

            {/* Learning Objectives */}
            <div style={{ marginBottom: '15px' }}>
              <label>Learning Objectives</label>
              {currentModule.learningObjectives.map((objective, index) => (
                <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <input
                    type="text"
                    value={objective}
                    onChange={(e) => handleLearningObjectiveChange(index, e.target.value)}
                    style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    placeholder={`Learning objective ${index + 1}`}
                  />
                  {currentModule.learningObjectives.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newObjectives = currentModule.learningObjectives.filter((_, i) => i !== index);
                        setCurrentModule(prev => ({ ...prev, learningObjectives: newObjectives }));
                      }}
                      style={{ padding: '8px 12px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addLearningObjective}
                style={{ padding: '8px 16px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                + Add Learning Objective
              </button>
            </div>

            {/* Detailed Content */}
            <div style={{ marginBottom: '15px' }}>
              <label>Detailed Explanations</label>
              {currentModule.detailedContent.explanations.map((explanation, index) => (
                <div key={index} style={{ border: '1px solid #eee', padding: '15px', marginBottom: '15px', borderRadius: '4px' }}>
                  <div style={{ marginBottom: '10px' }}>
                    <input
                      type="text"
                      value={explanation.title}
                      onChange={(e) => handleExplanationChange(index, 'title', e.target.value)}
                      style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                      placeholder="Explanation title"
                    />
                  </div>
                  
                  <div style={{ marginBottom: '10px' }}>
                    <textarea
                      value={explanation.content}
                      onChange={(e) => handleExplanationChange(index, 'content', e.target.value)}
                      style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '60px' }}
                      placeholder="Detailed explanation"
                    />
                  </div>
                  
                  <div>
                    <label>Examples:</label>
                    {explanation.examples.map((example, exampleIndex) => (
                      <div key={exampleIndex} style={{ display: 'flex', gap: '10px', marginBottom: '5px' }}>
                        <input
                          type="text"
                          value={example}
                          onChange={(e) => handleExampleChange(index, exampleIndex, e.target.value)}
                          style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                          placeholder={`Example ${exampleIndex + 1}`}
                        />
                        {explanation.examples.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newExplanations = [...currentModule.detailedContent.explanations];
                              newExplanations[index].examples = newExplanations[index].examples.filter((_, i) => i !== exampleIndex);
                              setCurrentModule(prev => ({
                                ...prev,
                                detailedContent: { ...prev.detailedContent, explanations: newExplanations }
                              }));
                            }}
                            style={{ padding: '8px 12px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addExample(index)}
                      style={{ padding: '6px 12px', background: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                    >
                      + Add Example
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addExplanation}
                style={{ padding: '8px 16px', background: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                + Add Explanation
              </button>
            </div>

            {/* Key Points */}
            <div style={{ marginBottom: '15px' }}>
              <label>Key Points</label>
              {currentModule.detailedContent.keyPoints.map((point, index) => (
                <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <input
                    type="text"
                    value={point}
                    onChange={(e) => handleKeyPointChange(index, e.target.value)}
                    style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    placeholder={`Key point ${index + 1}`}
                  />
                  {currentModule.detailedContent.keyPoints.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newKeyPoints = currentModule.detailedContent.keyPoints.filter((_, i) => i !== index);
                        setCurrentModule(prev => ({
                          ...prev,
                          detailedContent: { ...prev.detailedContent, keyPoints: newKeyPoints }
                        }));
                      }}
                      style={{ padding: '8px 12px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addKeyPoint}
                style={{ padding: '8px 16px', background: '#ffc107', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                + Add Key Point
              </button>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label>Module Summary</label>
              <textarea
                value={currentModule.detailedContent.summary}
                onChange={(e) => handleDetailedContentChange('summary', e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '60px' }}
                placeholder="Summary of what was covered in this module"
              />
            </div>

            <button
              type="button"
              onClick={addModule}
              style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              + Add Module
            </button>
          </div>

          {/* Added Modules List */}
          {courseData.modules.length > 0 && (
            <div>
              <h4>Added Modules ({courseData.modules.length})</h4>
              {courseData.modules.map((module, index) => (
                <div key={index} style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '10px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{module.title}</strong>
                    <p style={{ margin: '5px 0', color: '#666' }}>{module.description}</p>
                    <small>Duration: {module.duration} minutes</small>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeModule(index)}
                    style={{ padding: '6px 12px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {message && (
          <div style={{ 
            padding: '10px', 
            borderRadius: '4px', 
            background: message.includes('Error') ? '#f8d7da' : '#d4edda',
            color: message.includes('Error') ? '#721c24' : '#155724',
            border: `1px solid ${message.includes('Error') ? '#f5c6cb' : '#c3e6cb'}`
          }}>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || courseData.modules.length < 5}
          style={{ 
            padding: '15px 30px', 
            background: loading || courseData.modules.length < 5 ? '#6c757d' : '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: loading || courseData.modules.length < 5 ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'Creating Course...' : `Create Course (${courseData.modules.length}/5 modules)`}
        </button>
      </form>
    </div>
  );
};

export default CourseCreationForm; 