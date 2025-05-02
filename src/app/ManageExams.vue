<template>
  <div class="manage-exams">
    <div class="header-container">
      <div class="header-content">
        <h1>Manage Exams<span class="material-icons">assignment</span></h1>
        <div class="divider"></div>
        <div class="header-text">
          <p class="subtitle">Create, edit and monitor your exams</p>
        </div>
      </div>
      <div class="header-background">EXAMS</div>
    </div>

      <div class="header-actions">
        <button class="template-btn" @click="downloadTemplate">
          <i class="fas fa-file-download"></i> Download Template
        </button>
        <label class="import-btn">
          <i class="fas fa-file-upload"></i> Import Exam
          <input 
            type="file" 
            accept=".xlsx" 
            @change="handleImport" 
            style="display: none"
          >
        </label>
        <router-link to="/create-exam" class="create-btn">
          <i class="fas fa-plus"></i> Create New Exam
        </router-link>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <span class="material-icons-round rotating">sync</span>
      <p>Loading exams...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <span class="material-icons-round">error_outline</span>
      <p>{{ error }}</p>
      <button @click="loadExams" class="retry-btn">
        <span class="material-icons-round">refresh</span>
        Retry
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="!exams.length" class="empty-state">
      <span class="material-icons-round">assignment</span>
      <p>No exams found</p>
      <p class="subtitle">Create your first exam to get started</p>
      <router-link to="/create-exam" class="create-btn">
        <i class="fas fa-plus"></i> Create Exam
      </router-link>
    </div>

    <!-- Exams List -->
    <div v-else class="exams-grid">
      <div v-for="exam in exams" :key="exam.id" class="exam-card" :class="exam.status">
        <div class="exam-header">
          <div class="texture-layer"></div>
          <h2>{{ exam.examTitle }}</h2>
          <div class="exam-meta">
            <span class="exam-meta-item">
              <i class="fas fa-chalkboard"></i> {{ exam.classCode || 'No Class' }}
            </span>
            <span class="exam-meta-item">
              <i class="fas fa-key"></i> {{ exam.testCode }}
            </span>
            <span class="exam-meta-item" :class="'status-' + exam.status">
              <i class="fas fa-circle"></i> {{ formatStatus(exam.status) }}
            </span>
          </div>
        </div>

        <div class="exam-body">
          <div class="exam-info">
            <div class="info-item">
              <span class="material-icons-round">help_outline</span>
              <div class="info-content">
                <span class="info-label">Questions</span>
                <span class="info-value">{{ exam.questions.length }} items</span>
        </div>
          </div>
            <div class="info-item">
              <span class="material-icons-round">people</span>
              <div class="info-content">
                <span class="info-label">Submissions</span>
                <span class="info-value">{{ exam.scores.length }}</span>
              </div>
            </div>
            <div v-if="exam.scores.length" class="info-item">
              <span class="material-icons-round">analytics</span>
              <div class="info-content">
                <span class="info-label">Average Score</span>
                <span class="info-value">{{ calculateAverageScore(exam.scores) }}%</span>
              </div>
            </div>
          </div>
        </div>

        <div class="exam-actions">
          <button 
            v-if="!exam.scores.length"
            @click="editExam(exam)" 
            class="action-btn edit-btn"
            title="Edit exam"
          >
            <i class="fas fa-edit"></i> Edit
          </button>

          <button 
            @click="previewExam(exam)" 
            class="action-btn preview-btn"
            title="Preview exam"
          >
            <i class="fas fa-eye"></i> Preview
          </button>

          <button 
            v-if="exam.status === 'pending' || exam.status === 'stopped'"
            @click="startExam(exam.testCode)" 
            class="action-btn start-btn"
            title="Start exam"
          >
            <i class="fas fa-play"></i> Start
          </button>

          <button 
            v-if="exam.status === 'started'"
            @click="stopExam(exam.testCode)" 
            class="action-btn stop-btn"
            title="Stop exam"
          >
            <i class="fas fa-stop"></i> Stop
          </button>

          <button 
            v-if="exam.status !== 'started' && !exam.scores.length"
            @click="confirmDelete(exam)" 
            class="action-btn delete-btn"
            title="Delete exam"
          >
            <i class="fas fa-trash"></i> Delete
          </button>

          <button 
            @click="viewResults(exam)" 
            class="action-btn results-btn"
            title="View results"
            :disabled="!exam.scores.length"
          >
            <i class="fas fa-chart-bar"></i> Results
          </button>

          <button 
            @click="exportExam(exam)" 
            class="action-btn export-btn"
            title="Export exam"
          >
            <i class="fas fa-file-export"></i> Export
          </button>

          <button 
            @click="openAccessModal(exam)" 
            class="action-btn access-btn"
            title="Manage access"
          >
            <span class="material-icons-round">security</span>
            Access
          </button>

          <button 
            @click="viewPrintableExam(exam)" 
            class="action-btn paper-btn"
            title="View printable exam"
          >
            <i class="fas fa-file-alt"></i> Paper
          </button>

          <button 
            v-if="exam.scores.length > 0"
            @click="viewMPS(exam)" 
            class="action-btn mps-btn"
            title="View MPS Analysis"
          >
            <i class="fas fa-chart-line"></i> MPS
          </button>
        </div>
      </div>
    </div>

    <!-- Access Modal -->
    <div v-if="showAccessModal" class="modal-backdrop" @click.self="closeAccessModal">
      <div class="access-modal" :class="{ 'modal-closing': isClosing }">
        <div class="modal-handle"></div>
        
        <div class="modal-header">
          <h2>
            <span class="material-icons-round">security</span>
            Manage Exam Access
          </h2>
          <button @click="closeAccessModal" class="close-btn">
            <span class="material-icons-round">close</span>
          </button>
        </div>

        <div class="modal-body">
          <!-- Exam Info Card -->
          <div class="access-exam-info">
            <h3>{{ selectedExam.examTitle }}</h3>
            <div class="exam-meta">
              <span class="meta-item">
                <span class="material-icons-round">code</span>
                Test Code: {{ selectedExam.testCode }}
              </span>
              <span class="meta-item">
                <span class="material-icons-round">class</span>
                Class: {{ selectedExam.classCode }}
              </span>
            </div>
          </div>

          <!-- Access Control Toggle -->
          <div class="access-control-section">
            <div class="access-type-header">
              <h4>Access Control Mode</h4>
              <div class="toggle-wrapper">
                <label class="switch">
                  <input type="checkbox" v-model="restrictAccess" @change="toggleAccessRestriction">
                  <span class="slider round"></span>
                </label>
                <span class="toggle-state">{{ restrictAccess ? 'Restricted Access' : 'Open Access' }}</span>
              </div>
            </div>
            
            <div class="access-description">
              <div class="description-icon">
                <span class="material-icons-round">{{ restrictAccess ? 'lock' : 'public' }}</span>
              </div>
              <div class="description-text">
                <p>{{ restrictAccess ? 
                  'Only students from selected grade sections will be able to access this exam.' : 
                  'All students can access this exam regardless of their grade or section.' }}</p>
              </div>
            </div>
          </div>

          <!-- Grade Section Access (Only visible when restricted) -->
          <div v-if="restrictAccess" class="section-access-container">
            <div class="section-form-card">
              <h4>
                <span class="material-icons-round">add_circle</span>
                Add Grade Section Access
              </h4>
              
              <div class="section-form">
                <div class="form-row">
                  <div class="form-group">
                    <label for="gradeSelect">Grade Level</label>
                    <select 
                      id="gradeSelect"
                      v-model="newAccessGrade" 
                      @change="loadSectionsForGrade"
                      class="form-select"
                    >
                      <option value="">Select Grade</option>
                      <option 
                        v-for="grade in availableGrades" 
                        :key="grade" 
                        :value="grade"
                      >
                        Grade {{ grade }}
                      </option>
                    </select>
                  </div>
                  
                  <div class="form-group">
                    <label for="sectionSelect">Section</label>
                    <select 
                      id="sectionSelect"
                      v-model="newAccessSection" 
                      :disabled="!newAccessGrade"
                      class="form-select"
                    >
                      <option value="">Select Section</option>
                      <option 
                        v-for="section in availableSectionsForGrade" 
                        :key="section" 
                        :value="section"
                      >
                        {{ section }}
                      </option>
                    </select>
                  </div>
                  
                  <div class="form-action">
                    <button 
                      @click="addAccessSection" 
                      class="add-section-btn"
                      :disabled="!newAccessGrade || !newAccessSection"
                    >
                      <span class="material-icons-round">add</span>
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Section Access List -->
            <div class="section-list-card">
              <div class="list-header">
                <h4>
                  <span class="material-icons-round">list</span>
                  Authorized Grade Sections
                </h4>
                <span class="section-count">{{ accessSections.length }} sections</span>
              </div>
              
              <div v-if="accessSections.length === 0" class="empty-sections">
                <span class="material-icons-round">info</span>
                <p>No sections have been added</p>
                <p class="empty-hint">Students won't be able to access this exam until you add at least one section.</p>
              </div>
              
              <div v-else class="sections-list">
                <div v-for="(section, index) in accessSections" :key="index" class="section-item">
                  <div class="section-info">
                    <span class="grade-badge">Grade {{ section.grade }}</span>
                    <span class="section-name">{{ section.section }}</span>
                  </div>
                  <button @click="removeAccessSection(index)" class="remove-section-btn">
                    <span class="material-icons-round">delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeAccessModal" class="cancel-btn">
            <span class="material-icons-round">close</span>
            Cancel
          </button>
          <button @click="saveAccessSettings" class="save-btn">
            <span class="material-icons-round">save</span>
            Save Access Settings
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { 
  fetchTeacherExams, 
  deleteExam, 
  startExam as startExamApi, 
  stopExam as stopExamApi,
  createExam,
  getAllGradeSections,
  setExamAccess,
  getExamAccess
} from '../../services/authService';
import Swal from 'sweetalert2';
import socketManager from '@/utils/socketManager';
import { generateExamTemplate, exportExamToExcel, parseExcelFile } from '@/utils/excelTemplates';

export default {
  name: 'ManageExams',
  
  setup() {
    const router = useRouter();
    const exams = ref([]);
    const loading = ref(true);
    const error = ref(null);
    const socket = ref(null);
    const showAccessModal = ref(false);
    const selectedExam = ref(null);
    const restrictAccess = ref(false);
    const newAccessGrade = ref('');
    const newAccessSection = ref('');
    const accessSections = ref([]);
    const availableGrades = ref([]);
    const availableSections = ref([]);
    const isClosing = ref(false);

    // Initialize socket connection
    onMounted(() => {
      socket.value = socketManager.getSocket();
      loadExams();
      loadGradeSections();
    });

    const loadExams = async () => {
      try {
        loading.value = true;
        error.value = null;
        exams.value = await fetchTeacherExams();
      } catch (err) {
        error.value = err.message || 'Failed to load exams';
        console.error('Error loading exams:', err);
      } finally {
        loading.value = false;
      }
    };

    const formatStatus = (status) => {
      const statusMap = {
        draft: 'Draft',
        pending: 'Ready',
        started: 'In Progress',
        stopped: 'Ready'
      };
      return statusMap[status] || status;
    };

    const calculateAverageScore = (scores) => {
      if (!scores.length) return 0;
      const total = scores.reduce((sum, score) => sum + score.percentage, 0);
      return (total / scores.length).toFixed(1);
    };

    const editExam = (exam) => {
      router.push({
        path: '/create-exam',
        query: { examId: exam.id }
      });
    };

    const confirmDelete = async (exam) => {
      const result = await Swal.fire({
        title: 'Delete Exam?',
        text: "This action cannot be undone!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
        try {
          await deleteExam(exam.id);
          await loadExams(); // Refresh the list
          Swal.fire('Deleted!', 'The exam has been deleted.', 'success');
        } catch (error) {
          Swal.fire('Error!', error.message, 'error');
        }
      }
    };

    const startExam = async (testCode) => {
      try {
        await startExamApi(testCode);
        
        // Emit socket event for exam start
        socket.value.emit('examStatusChanged', { 
          testCode: testCode, 
          status: 'started' 
        });
        
        await loadExams(); // Refresh the list
        Swal.fire('Success!', 'Exam has been started.', 'success');
      } catch (error) {
        Swal.fire('Error!', error.message, 'error');
      }
    };

    const stopExam = async (testCode) => {
      try {
        await stopExamApi(testCode);
        
        // Emit socket event for exam stop
        socket.value.emit('examStatusChanged', { 
          testCode: testCode, 
          status: 'stopped' 
        });
        
        await loadExams(); // Refresh the list
        Swal.fire('Success!', 'Exam has been stopped.', 'success');
      } catch (error) {
        Swal.fire('Error!', error.message, 'error');
      }
    };

    const viewResults = (exam) => {
      router.push({
        path: `/exam-results/${exam.id}`,
        query: { 
          title: exam.examTitle,
          testCode: exam.testCode
        }
      });
    };

    const previewExam = (exam) => {
      router.push(`/preview-exam/${exam.id}`);
    };

    const downloadTemplate = () => {
      generateExamTemplate();
    };

    const handleImport = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      try {
        const examData = await parseExcelFile(file);
        
        // Validate questions format
        if (!examData.questions || !Array.isArray(examData.questions)) {
          throw new Error('Invalid questions format');
        }

        // Validate that we have at least one question
        if (examData.questions.length === 0) {
          throw new Error('No questions found in the Excel file');
        }

        // Ensure all values are strings and convert to uppercase where needed
        const testCode = String(examData.testCode || '').toUpperCase();
        const classCode = String(examData.classCode || '').toUpperCase();
        const examTitle = String(examData.examTitle || '').toUpperCase();

        // Validate required fields
        if (!testCode || !classCode || !examTitle) {
          throw new Error('Test Code, Class Code, and Exam Title are required');
        }

        // Validate question structure
        const validatedQuestions = examData.questions.map((q, index) => {
          if (!q.questionText || !q.questionType || !q.correctAnswer) {
            throw new Error(`Invalid question format at question ${index + 1}`);
          }

          return {
            questionText: String(q.questionText).trim(),
            questionType: String(q.questionType).trim(),
            options: Array.isArray(q.options) ? q.options.map(opt => String(opt).trim()) : [],
            correctAnswer: String(q.correctAnswer).trim()
          };
        });

        // Create the exam with proper structure
        await createExam(
          testCode,
          classCode,
          examTitle,
          validatedQuestions,
          localStorage.getItem('userId'),
          true // isDraft
        );

        await loadExams();
        Swal.fire({
          title: 'Success',
          text: 'Exam imported successfully',
          icon: 'success',
          confirmButtonColor: '#4CAF50'
        });
      } catch (error) {
        console.error('Import error:', error);
        Swal.fire({
          title: 'Error',
          text: error.message || 'Failed to import exam',
          icon: 'error',
          confirmButtonColor: '#f44336'
        });
      } finally {
        // Reset file input
        event.target.value = '';
      }
    };

    const exportExam = (exam) => {
      exportExamToExcel(exam);
    };

    const openAccessModal = async (exam) => {
      selectedExam.value = exam;
      showAccessModal.value = true;
      
      // Reset form values
      newAccessGrade.value = '';
      newAccessSection.value = '';
      accessSections.value = [];
      
      // Load grade sections if not already loaded
      if (availableGrades.value.length === 0) {
        await loadGradeSections();
      }
      
      // Load current access settings for this exam
      await loadExamAccess(exam.id);
    };

    const closeAccessModal = () => {
      isClosing.value = true;
      setTimeout(() => {
        showAccessModal.value = false;
        isClosing.value = false;
      }, 300); // Match this with your animation duration
    };

    const toggleAccessRestriction = () => {
      if (!restrictAccess.value) {
        // When switching to open access, clear the sections list
        accessSections.value = [];
      }
    };

    const loadSectionsForGrade = () => {
      newAccessSection.value = '';
    };

    const addAccessSection = () => {
      if (!newAccessGrade.value || !newAccessSection.value) return;

      // Check if section already exists in access list
      const exists = accessSections.value.some(
        s => s.grade === newAccessGrade.value && s.section === newAccessSection.value
      );

      if (exists) {
        Swal.fire({
          icon: 'warning',
          title: 'Section Already Added',
          text: `Grade ${newAccessGrade.value} Section ${newAccessSection.value} is already in the list`
        });
        return;
      }

      // Add new section to access list
      accessSections.value.push({
        examId: selectedExam.value.id,
        grade: newAccessGrade.value,
        section: newAccessSection.value,
        isEnabled: true
      });

      // Reset section input only, keep grade for adding multiple sections
      newAccessSection.value = '';
    };

    const removeAccessSection = (index) => {
      accessSections.value.splice(index, 1);
    };

    const saveAccessSettings = async () => {
      try {
        if (!restrictAccess.value) {
          // If not restricting access, remove all access settings
          await setExamAccess(selectedExam.value.id, []);
          Swal.fire({
            icon: 'success',
            title: 'Access Updated',
            text: 'Exam access is now open to all students'
          });
          closeAccessModal();
          return;
        }
        
        // If restricting but no sections added
        if (accessSections.value.length === 0) {
          Swal.fire({
            icon: 'warning',
            title: 'No Sections Added',
            text: 'Please add at least one section or disable access restriction'
          });
          return;
        }
        
        // Prepare data for the API
        const gradeAccess = accessSections.value.map(section => ({
          examId: selectedExam.value.id,
          grade: section.grade,
          section: section.section,
          isEnabled: true
        }));
        
        // Save access settings
        await setExamAccess(selectedExam.value.id, gradeAccess);
        
        Swal.fire({
          icon: 'success',
          title: 'Access Updated',
          text: 'Exam access settings have been updated'
        });
        
        closeAccessModal();
      } catch (error) {
        console.error('Error saving exam access:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to save exam access settings'
        });
      }
    };

    const loadGradeSections = async () => {
      try {
        const { gradeSections } = await getAllGradeSections();
        console.log('Fetched grade sections:', gradeSections);

        if (gradeSections && gradeSections.length > 0) {
          // Get unique grades
          availableGrades.value = [...new Set(gradeSections.map(gs => gs.grade))]
            .sort((a, b) => a - b);

          // Store all sections with their grades
          availableSections.value = gradeSections.map(gs => ({
            id: gs.id,
            grade: gs.grade,
            section: gs.section
          }));

          console.log('Available grades:', availableGrades.value);
          console.log('Available sections:', availableSections.value);
        }
      } catch (error) {
        console.error('Error loading grade sections:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load grade sections'
        });
      }
    };

    const loadExamAccess = async (examId) => {
      try {
        const response = await getExamAccess(examId);
        
        if (response && response.access) {
          // If there are access settings, then the exam has restricted access
          if (response.access.length > 0) {
            restrictAccess.value = true;
            accessSections.value = response.access.map(access => ({
              examId: access.examId,
              grade: access.grade,
              section: access.section,
              isEnabled: access.isEnabled
            }));
          } else {
            // No access settings means open access
            restrictAccess.value = false;
            accessSections.value = [];
          }
        }
      } catch (error) {
        console.error('Error loading exam access settings:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load exam access settings'
        });
      }
    };

    const viewPrintableExam = (exam) => {
      router.push(`/exam-paper/${exam.id}`);
    };

    const viewMPS = (exam) => {
      router.push(`/exam-mps/${exam.id}`);
    };

    // Clean up socket listeners on component unmount
    onUnmounted(() => {
      if (socket.value) {
        // No need to disconnect, just remove any listeners if needed
        socket.value.off('examStatusUpdate');
      }
    });

    // Computed property to filter sections based on selected grade
    const availableSectionsForGrade = computed(() => {
      if (!newAccessGrade.value) return [];
      
      // Filter sections for selected grade
      return availableSections.value
        .filter(gs => gs.grade === parseInt(newAccessGrade.value))
        .map(gs => gs.section);
    });

    return {
      exams,
      loading,
      error,
      loadExams,
      formatStatus,
      calculateAverageScore,
      editExam,
      confirmDelete,
      startExam,
      stopExam,
      viewResults,
      previewExam,
      downloadTemplate,
      handleImport,
      exportExam,
      showAccessModal,
      selectedExam,
      restrictAccess,
      newAccessGrade,
      newAccessSection,
      accessSections,
      availableGrades,
      availableSections,
      availableSectionsForGrade,
      openAccessModal,
      closeAccessModal,
      toggleAccessRestriction,
      loadSectionsForGrade,
      addAccessSection,
      removeAccessSection,
      saveAccessSettings,
      isClosing,
      viewPrintableExam,
      viewMPS
    };
  }
};
</script>

<style scoped>
.manage-exams {
  max-width: auto;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  overflow-y: hidden;
  overflow-x: hidden;
}

.header-container {
  position: relative;
  margin-bottom: 30px;
}

.header-content {
  position: relative;
  z-index: 1;
}

.header-content h1 {
  color: #159750;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
}

.header-content h1 .material-icons {
  color: #159750;
  font-size: 2.5rem;
  font-weight: 700;
  padding-left: 1%;
}

.header-background {
  position: absolute;
  top: 20%;
  right: 5rem;
  transform: translateY(-50%);
  font-size: 8rem;
  font-weight: 900;
  color: rgba(0, 0, 0, 0.03);
  z-index: 0;
  user-select: none;
  pointer-events: none;
  overflow: hidden;
  white-space: nowrap;
}

.divider {
  height: 1px;
  background-color: #e0e0e0;
  margin: 1.5rem 0;
  width: 100%;
  max-width: auto; 
}

.subtitle {
  color: #666;
  font-size: 1.1rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.template-btn, .import-btn, .create-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
}

.template-btn {
  background-color: #e8f5e9;
  color: #2e7d32;
  border: none;
}

.template-btn:hover {
  background-color: #c8e6c9;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.import-btn {
  background-color: #e3f2fd;
  color: #1565c0;
  border: none;
}

.import-btn:hover {
  background-color: #bbdefb;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.create-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
}

.create-btn:hover {
  background-color: #43a047;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Loading, Error, Empty States */
.loading-state, .error-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  text-align: center;
  margin-bottom: 2rem;
}

.loading-state .material-icons-round, 
.error-state .material-icons-round, 
.empty-state .material-icons-round {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.loading-state .material-icons-round {
  color: #159750;
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state .material-icons-round {
  color: #f44336;
}

.empty-state .material-icons-round {
  color: #9e9e9e;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.3s;
}

.retry-btn:hover {
  background: #d32f2f;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Exams Grid */
.exams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.exam-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.12),
  0 4px 16px -2px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
}

.exam-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.exam-header {
  background: linear-gradient(135deg, #0bcc4e 0%, #159750 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

/* Main paint swipe */
.exam-header::after {
  content: '';
  position: absolute;
  top: 0;
  right: -10%;
  width: 50%;
  height: 100%;
  background: linear-gradient(45deg, 
    transparent 0%,
    rgba(255, 255, 255, 0.05) 30%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.05) 70%,
    transparent 100%
  );
  transform: skewX(-20deg);
  pointer-events: none;
}

/* Secondary paint swipe */
.exam-header::before {
  content: '';
  position: absolute;
  top: -20%;
  right: 20%;
  width: 30%;
  height: 200%;
  background: linear-gradient(45deg,
    transparent 0%,
    rgba(255, 255, 255, 0.02) 30%,
    rgba(255, 255, 255, 0.05) 50%,
    rgba(255, 255, 255, 0.02) 70%,
    transparent 100%
  );
  transform: skewX(-35deg);
  pointer-events: none;
}

/* Additional texture layers */
.exam-header .texture-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(
      circle at 50% 50%,
      rgba(255, 255, 255, 0.05) 0%,
      transparent 50%
    ),
    linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.03) 25%,
      rgba(255, 255, 255, 0.03) 75%,
      transparent 100%
    );
  pointer-events: none;
}

.exam-header h2 {
  margin: 0 0 10px 0;
  color: white;
  font-size: 1.5rem;
  position: relative;
  z-index: 1;
}

.exam-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  position: relative;
  z-index: 1;
}

.exam-meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(0, 0, 0, 0.1);
  padding: 4px 10px;
  border-radius: 20px;
}

.status-started {
  color: #4CAF50;
}

.status-pending {
  color: #FF9800;
}

.status-stopped {
  color: #F44336;
}

.exam-body {
  padding: 20px;
  flex: 1;
}

.exam-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 8px 0;
  color: #666;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 0.8rem;
  color: #9e9e9e;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 1rem;
  color: #424242;
}

.info-item .material-icons-round {
  font-size: 1.25rem;
  color: #159750;
  margin-top: 0.25rem;
}

.exam-actions {
  padding: 15px;
  background: #f5f5f5;
  border-top: 1px solid #eee;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.action-btn {
  flex: 1;
  min-width: calc(33.333% - 8px);
  padding: 8px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.edit-btn {
  background-color: #2196F3;
  color: white;
}

.edit-btn:hover {
  background-color: #1976D2;
}

.preview-btn {
  background-color: #673AB7;
  color: white;
}

.preview-btn:hover {
  background-color: #5E35B1;
}

.start-btn {
  background-color: #4CAF50;
  color: white;
}

.start-btn:hover {
  background-color: #43A047;
}

.stop-btn {
  background-color: #F44336;
  color: white;
}

.stop-btn:hover {
  background-color: #D32F2F;
}

.delete-btn {
  background-color: #FF5252;
  color: white;
}

.delete-btn:hover {
  background-color: #D50000;
}

.results-btn {
  background-color: #9C27B0;
  color: white;
}

.results-btn:hover {
  background-color: #7B1FA2;
}

.results-btn:disabled {
  background-color: #E1BEE7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.export-btn {
  background-color: #E8F5E9;
  color: #2E7D32;
}

.export-btn:hover {
  background-color: #C8E6C9;
}

.access-btn {
  background-color: #FFF3E0;
  color: #E65100;
}

.access-btn:hover {
  background-color: #FFE0B2;
}

.paper-btn {
  background-color: #ECEFF1;
  color: #455A64;
}

.paper-btn:hover {
  background-color: #CFD8DC;
}

/* Modal styles remain the same */

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  overflow-y: auto;
  padding: 20px;
}

.access-modal {
  background: white;
  border-radius: 16px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  position: relative;
  padding: 0;
  animation: modalFadeIn 0.3s ease;
  z-index: 1001;
}

.modal-closing {
  animation: modalFadeOut 0.3s ease forwards;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes modalFadeOut {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(20px);
  }
}

.modal-handle {
  width: 40px;
  height: 5px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  margin: 10px auto;
  display: none;
}

.modal-header {
  background: linear-gradient(135deg, #0bcc4e 0%, #159750 100%);
  padding: 20px;
  border-radius: 16px 16px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.modal-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(
      circle at 50% 50%,
      rgba(255, 255, 255, 0.05) 0%,
      transparent 50%
    ),
    linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.03) 25%,
      rgba(255, 255, 255, 0.03) 75%,
      transparent 100%
    );
  pointer-events: none;
}

.modal-header h2 {
  color: white;
  margin: 0;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
  z-index: 1;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  z-index: 1;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.modal-body {
  padding: 20px;
}

.access-exam-info {
  background: #f5f5f5;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 20px;
}

.access-exam-info h3 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 1.2rem;
}

.exam-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  color: #666;
}

.access-control-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.access-type-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.access-type-header h4 {
  margin: 0;
  color: #333;
  font-size: 1.1rem;
}

.toggle-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.toggle-state {
  font-size: 0.9rem;
  font-weight: 500;
  color: #666;
}

.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
}

input:checked + .slider {
  background-color: #4CAF50;
}

input:focus + .slider {
  box-shadow: 0 0 1px #4CAF50;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}

.access-description {
  display: flex;
  gap: 15px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 8px;
  margin-top: 15px;
}

.description-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #e8f5e9;
  border-radius: 50%;
  color: #4CAF50;
}

.description-text p {
  margin: 0;
  color: #666;
  line-height: 1.5;
}

.section-list-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-list-header h4 {
  margin: 0;
  color: #333;
  font-size: 1.1rem;
}

.section-form-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.form-row {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.form-group {
  flex: 1;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
}

.add-section-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.add-section-btn:hover {
  background: #43A047;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.section-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 300px;
  overflow-y: auto;
  padding: 5px;
}

.section-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background: #f5f5f5;
  border-radius: 8px;
  transition: all 0.2s;
}

.section-item:hover {
  background: #e8f5e9;
}

.section-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-grade {
  font-weight: 600;
  color: #333;
}

.section-name {
  color: #666;
}

.remove-section-btn {
  background: none;
  border: none;
  color: #f44336;
  cursor: pointer;
  transition: all 0.2s;
}

.remove-section-btn:hover {
  color: #d32f2f;
  transform: scale(1.1);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding: 20px;
  border-top: 1px solid #eee;
}

.cancel-btn {
  padding: 10px 20px;
  background: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background: #e0e0e0;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.save-btn {
  padding: 10px 20px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.save-btn:hover {
  background: #43A047;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Responsive styles for the modal */
@media (max-width: 768px) {
  .manage-exams {
    padding: 10px 5px; /* Further reduce padding on mobile */
  }
  .access-modal {
    width: 95%;
    max-height: 90vh;
  }

  .form-row {
    flex-direction: column;
    gap: 10px;
  }
  
  .modal-footer {
    flex-direction: column-reverse;
    gap: 10px;
  }
  
  .cancel-btn, 
  .save-btn {
    width: 100%;
  }
  
  .access-type-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .template-btn, .import-btn, .create-btn {
    width: calc(32% - 8px);
    padding: 10px 8px;
    font-size: 0.9rem;
    text-align: center;
    flex-direction: column;
    gap: 4px;
  }

  .template-btn i, 
  .import-btn i, 
  .create-btn i {
    font-size: 1.1rem;
  }
  .header-background {
  position: absolute;
  top: 60%;
  right: 1rem;
  transform: translateY(-50%);
  font-size: 3rem;
  font-weight: 900;
  color: rgba(0, 0, 0, 0.03);
  z-index: 0;
  user-select: none;
  pointer-events: none;
  overflow: hidden;
  white-space: nowrap;
}
  .toggle-wrapper {
    align-self: flex-start;
  }
}
</style> 