import { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://127.0.0.1:8000/api';

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

const profileTemplate = () => ({
  name: '',
  email: '',
  education: '',
  github: '',
  linkedin: '',
  portfolio: '',
});

const projectTemplate = () => ({
  title: '',
  description: '',
  links: '',
});

const workTemplate = () => ({
  company: '',
  role: '',
  start_date: '',
  end_date: '',
  description: '',
});

const skillTemplate = () => ({
  name: '',
});

const pickProfileFields = (profile) => ({
  name: profile?.name ?? '',
  email: profile?.email ?? '',
  education: profile?.education ?? '',
  github: profile?.github ?? '',
  linkedin: profile?.linkedin ?? '',
  portfolio: profile?.portfolio ?? '',
});

function App() {
  const [profiles, setProfiles] = useState([]);
  const [status, setStatus] = useState('Idle');
  const [error, setError] = useState('');

  const [profileForm, setProfileForm] = useState(profileTemplate());
  const [editingProfileId, setEditingProfileId] = useState(null);
  const [profileEditForm, setProfileEditForm] = useState(profileTemplate());

  const [skillEditing, setSkillEditing] = useState({});

  const [projectEditing, setProjectEditing] = useState({});

  const [workEditing, setWorkEditing] = useState({});

  const [modalState, setModalState] = useState({ type: null, profileId: null, data: null });

  const [expandedSections, setExpandedSections] = useState({});

  const [skillQuery, setSkillQuery] = useState('');
  const [skillResults, setSkillResults] = useState([]);
  const hasFetched = useRef(false);

  const markReady = () => {
    setStatus('Ready');
    setError('');
  };

  const handleError = (message, err) => {
    console.error(err);
    setStatus('Error');
    setError(message);
  };

  const fetchProfiles = async () => {
    setStatus('Loading profiles…');
    try {
      const { data } = await client.get('/profiles/');
      setProfiles(data);
      markReady();
    } catch (err) {
      handleError('Failed to load profiles.', err);
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchProfiles();
  }, []);

  const handleCreateProfile = async (event) => {
    event.preventDefault();
    try {
      setStatus('Creating profile…');
      await client.post('/profiles/', profileForm);
      setProfileForm(profileTemplate());
      setEditingProfileId(null);
      await fetchProfiles();
    } catch (err) {
      handleError('Failed to create profile.', err);
    }
  };

  const handleStartProfileEdit = (profile) => {
    setEditingProfileId(profile.id);
    setProfileEditForm(pickProfileFields(profile));
  };

  const handleUpdateProfile = async (event, profileId) => {
    event.preventDefault();
    try {
      setStatus('Updating profile…');
      await client.put(`/profiles/${profileId}/`, profileEditForm);
      setEditingProfileId(null);
      setProfileEditForm(profileTemplate());
      await fetchProfiles();
    } catch (err) {
      handleError('Failed to update profile.', err);
    }
  };

  const handleDeleteProfile = async (profileId) => {
    try {
      setStatus('Deleting profile…');
      await client.delete(`/profiles/${profileId}/`);
      if (editingProfileId === profileId) {
        setEditingProfileId(null);
        setProfileEditForm(profileTemplate());
      }
      await fetchProfiles();
    } catch (err) {
      handleError('Failed to delete profile.', err);
    }
  };

  const handleStartWorkEdit = (entry) => {
    setWorkEditing((prev) => ({
      ...prev,
      [entry.id]: {
        profile: entry.profile,
        company: entry.company ?? '',
        role: entry.role ?? '',
        start_date: entry.start_date ?? '',
        end_date: entry.end_date ?? '',
        description: entry.description ?? '',
      },
    }));
  };

  const handleWorkEditChange = (entryId, field, value) => {
    setWorkEditing((prev) => ({
      ...prev,
      [entryId]: {
        ...(prev[entryId] ?? {}),
        [field]: value,
      },
    }));
  };

  const handleSaveWork = async (entryId) => {
    const draft = workEditing[entryId];
    if (!draft || !draft.company.trim() || !draft.role.trim()) {
      return;
    }
    try {
      setStatus('Updating work…');
      const { data } = await client.put(`/work/${entryId}/`, draft);
      setWorkEditing((prev) => {
        const copy = { ...prev };
        delete copy[entryId];
        return copy;
      });
      setProfiles((prev) =>
        prev.map((p) =>
          p.id === draft.profile
            ? {
                ...p,
                work: (p.work ?? []).map((w) => (w.id === entryId ? data : w)),
              }
            : p
        )
      );
      markReady();
    } catch (err) {
      handleError('Failed to update work entry.', err);
    }
  };

  const handleCancelWorkEdit = (entryId) => {
    setWorkEditing((prev) => {
      const copy = { ...prev };
      delete copy[entryId];
      return copy;
    });
  };

  const handleDeleteWork = async (entryId) => {
    try {
      setStatus('Removing work…');
      await client.delete(`/work/${entryId}/`);
      handleCancelWorkEdit(entryId);
      setProfiles((prev) =>
        prev.map((p) => ({
          ...p,
          work: (p.work ?? []).filter((w) => w.id !== entryId),
        }))
      );
      markReady();
    } catch (err) {
      handleError('Failed to remove work entry.', err);
    }
  };

  const handleStartSkillEdit = (skill) => {
    setSkillEditing((prev) => ({ ...prev, [skill.id]: skill.name }));
  };

  const handleChangeSkillEdit = (skillId, value) => {
    setSkillEditing((prev) => ({ ...prev, [skillId]: value }));
  };

  const handleSaveSkill = async (skill, profileId) => {
    const name = (skillEditing[skill.id] ?? '').trim();
    if (!name) {
      return;
    }
    try {
      setStatus('Updating skill…');
      await client.patch(`/skills/${skill.id}/`, { name });
      setSkillEditing((prev) => {
        const copy = { ...prev };
        delete copy[skill.id];
        return copy;
      });
      setProfiles((prev) =>
        prev.map((p) =>
          p.id === profileId
            ? {
                ...p,
                skills: (p.skills ?? []).map((s) =>
                  s.id === skill.id ? { ...s, name } : s
                ),
              }
            : p
        )
      );
      markReady();
    } catch (err) {
      handleError('Failed to update skill.', err);
    }
  };

  const handleCancelSkillEdit = (skillId) => {
    setSkillEditing((prev) => {
      const copy = { ...prev };
      delete copy[skillId];
      return copy;
    });
  };

  const handleDeleteSkill = async (skillId) => {
    try {
      setStatus('Removing skill…');
      await client.delete(`/skills/${skillId}/`);
      handleCancelSkillEdit(skillId);
      setProfiles((prev) =>
        prev.map((p) => ({
          ...p,
          skills: (p.skills ?? []).filter((s) => s.id !== skillId),
        }))
      );
      markReady();
    } catch (err) {
      handleError('Failed to remove skill.', err);
    }
  };

  const handleStartProjectEdit = (project) => {
    setProjectEditing((prev) => ({
      ...prev,
      [project.id]: {
        title: project.title ?? '',
        description: project.description ?? '',
        links: project.links ?? '',
        profile: project.profile,
      },
    }));
  };

  const handleProjectEditChange = (projectId, field, value) => {
    setProjectEditing((prev) => ({
      ...prev,
      [projectId]: {
        ...(prev[projectId] ?? {}),
        [field]: value,
      },
    }));
  };

  const handleSaveProject = async (projectId) => {
    const draft = projectEditing[projectId];
    if (!draft || !draft.title.trim()) {
      return;
    }
    try {
      setStatus('Updating project…');
      const payload = {
        profile: draft.profile,
        title: draft.title,
        description: draft.description,
        links: draft.links,
      };
      const { data } = await client.put(`/projects/${projectId}/`, payload);
      setProjectEditing((prev) => {
        const copy = { ...prev };
        delete copy[projectId];
        return copy;
      });
      setProfiles((prev) =>
        prev.map((p) =>
          p.id === draft.profile
            ? {
                ...p,
                projects: (p.projects ?? []).map((proj) =>
                  proj.id === projectId ? data : proj
                ),
              }
            : p
        )
      );
      markReady();
    } catch (err) {
      handleError('Failed to update project.', err);
    }
  };

  const handleCancelProjectEdit = (projectId) => {
    setProjectEditing((prev) => {
      const copy = { ...prev };
      delete copy[projectId];
      return copy;
    });
  };

  const handleDeleteProject = async (projectId) => {
    try {
      setStatus('Removing project…');
      await client.delete(`/projects/${projectId}/`);
      handleCancelProjectEdit(projectId);
      setProfiles((prev) =>
        prev.map((p) => ({
          ...p,
          projects: (p.projects ?? []).filter((proj) => proj.id !== projectId),
        }))
      );
      markReady();
    } catch (err) {
      handleError('Failed to remove project.', err);
    }
  };

  const handleSkillSearch = async (event) => {
    event.preventDefault();
    if (!skillQuery.trim()) {
      setSkillResults([]);
      return;
    }
    try {
      setStatus('Searching projects…');
      const { data } = await client.get(`/projects/?skill=${encodeURIComponent(skillQuery)}`);
      setSkillResults(data);
      markReady();
    } catch (err) {
      handleError('Skill search failed.', err);
    }
  };

  const flattenedProjects = profiles.flatMap((profile) =>
    (profile.projects ?? []).map((project) => ({
      ...project,
      profileName: profile.name,
    })),
  );

  const closeModal = () => setModalState({ type: null, profileId: null, data: null });

  const openModal = (type, profileId) => {
    if (type === 'work') {
      setModalState({ type, profileId, data: workTemplate() });
    } else if (type === 'skill') {
      setModalState({ type, profileId, data: skillTemplate() });
    } else if (type === 'project') {
      setModalState({ type, profileId, data: projectTemplate() });
    } else {
      setModalState({ type: null, profileId: null, data: null });
    }
  };

  const handleModalChange = (field, value) => {
    setModalState((prev) => ({
      ...prev,
      data: {
        ...(prev.data ?? {}),
        [field]: value,
      },
    }));
  };

  const submitModal = async () => {
    const { type, profileId, data } = modalState;
    if (!type || !profileId || !data) {
      return;
    }

    try {
      if (type === 'work') {
        if (!data.company.trim() || !data.role.trim()) {
          return;
        }
        setStatus('Adding work…');
        const { data: newWork } = await client.post('/work/', { profile: profileId, ...data });
        setProfiles((prev) =>
          prev.map((p) =>
            p.id === profileId ? { ...p, work: [...(p.work ?? []), newWork] } : p
          )
        );
      }

      if (type === 'skill') {
        const trimmed = (data.name ?? '').trim();
        if (!trimmed) {
          return;
        }
        setStatus('Adding skill…');
        const { data: newSkill } = await client.post('/skills/', { profile: profileId, name: trimmed });
        setProfiles((prev) =>
          prev.map((p) =>
            p.id === profileId ? { ...p, skills: [...(p.skills ?? []), newSkill] } : p
          )
        );
      }

      if (type === 'project') {
        if (!(data.title ?? '').trim()) {
          return;
        }
        setStatus('Adding project…');
        const { data: newProject } = await client.post('/projects/', { profile: profileId, ...data });
        setProfiles((prev) =>
          prev.map((p) =>
            p.id === profileId ? { ...p, projects: [...(p.projects ?? []), newProject] } : p
          )
        );
      }

      closeModal();
      markReady();
    } catch (err) {
      handleError('Failed to submit entry.', err);
    }
  };

  const toggleSection = (profileId, section) => {
    setExpandedSections((prev) => {
      const key = `${profileId}-${section}`;
      return {
        ...prev,
        [key]: !prev[key],
      };
    });
  };

  const isSectionExpanded = (profileId, section) => !!expandedSections[`${profileId}-${section}`];

  return (
    <div className="app-shell">
      <header className="home-hero">
        <div>
          <p className="eyebrow">Welcome home</p>
          <h1>Lokesh Lohar · Portfolio control</h1>
          <p className="lede">
            Manage every profile, skill, and project from a single dashboard while your React frontend talks directly to the Django API.
          </p>
        </div>
        <span className={`status-chip ${status === 'Error' ? 'error' : ''}`}>{status}</span>
      </header>

      <section className="section profiles-section">
        <div className="section-headline">
          <h2>Profiles</h2>
          <p>Review, edit, or remove profiles. Add as many as you need.</p>
        </div>
        <div className="profiles-grid">
          {profiles.map((profile) => (
            <article key={profile.id} className="profile-card">
              {editingProfileId === profile.id ? (
                <form onSubmit={(event) => handleUpdateProfile(event, profile.id)} className="profile-form">
                  <label>
                    Name
                    <input
                      value={profileEditForm.name}
                      onChange={(event) => setProfileEditForm((prev) => ({ ...prev, name: event.target.value }))}
                      required
                    />
                  </label>
                  <label>
                    Email
                    <input
                      type="email"
                      value={profileEditForm.email}
                      onChange={(event) => setProfileEditForm((prev) => ({ ...prev, email: event.target.value }))}
                      required
                    />
                  </label>
                  <label>
                    Education
                    <input
                      value={profileEditForm.education}
                      onChange={(event) => setProfileEditForm((prev) => ({ ...prev, education: event.target.value }))}
                    />
                  </label>
                  <label>
                    GitHub
                    <input
                      value={profileEditForm.github}
                      onChange={(event) => setProfileEditForm((prev) => ({ ...prev, github: event.target.value }))}
                    />
                  </label>
                  <label>
                    LinkedIn
                    <input
                      value={profileEditForm.linkedin}
                      onChange={(event) => setProfileEditForm((prev) => ({ ...prev, linkedin: event.target.value }))}
                    />
                  </label>
                  <label>
                    Portfolio
                    <input
                      value={profileEditForm.portfolio}
                      onChange={(event) => setProfileEditForm((prev) => ({ ...prev, portfolio: event.target.value }))}
                    />
                  </label>
                  <div className="inline-actions">
                    <button type="submit" className="primary">Save</button>
                    <button type="button" className="text" onClick={() => setEditingProfileId(null)}>
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <header className="profile-heading">
                    <h3>{profile.name}</h3>
                    <div className="inline-actions">
                      <div className="add-actions">
                        <button type="button" className="text" onClick={() => openModal('work', profile.id)}>
                          + Work
                        </button>
                        <button type="button" className="text" onClick={() => openModal('skill', profile.id)}>
                          + Skill
                        </button>
                        <button type="button" className="text" onClick={() => openModal('project', profile.id)}>
                          + Project
                        </button>
                      </div>
                      <button type="button" className="text" onClick={() => handleStartProfileEdit(profile)}>
                        Edit
                      </button>
                      <button type="button" className="text danger" onClick={() => handleDeleteProfile(profile.id)}>
                        Delete
                      </button>
                    </div>
                  </header>
                  <p className="muted">{profile.email}</p>
                  {profile.education && <p>{profile.education}</p>}
                  <div className="profile-links">
                    {profile.github && (
                      <a href={profile.github} target="_blank" rel="noreferrer">
                        GitHub ↗
                      </a>
                    )}
                    {profile.linkedin && (
                      <a href={profile.linkedin} target="_blank" rel="noreferrer">
                        LinkedIn ↗
                      </a>
                    )}
                    {profile.portfolio && (
                      <a href={profile.portfolio} target="_blank" rel="noreferrer">
                        Portfolio ↗
                      </a>
                    )}
                  </div>
                  <div className="profile-subsection">
                    <button type="button" className="accordion-toggle" onClick={() => toggleSection(profile.id, 'work')}>
                      <span>Work history</span>
                      <span>{isSectionExpanded(profile.id, 'work') ? '−' : '+'}</span>
                    </button>
                    {isSectionExpanded(profile.id, 'work') && (
                      <div className="accordion-content">
                        {(profile.work ?? []).length ? (
                          <ul className="work-list">
                            {profile.work.map((item) => (
                              <li key={item.id}>
                                {workEditing[item.id] ? (
                                  <div className="stack-form">
                                    <input
                                      placeholder="Company"
                                      value={workEditing[item.id].company}
                                      onChange={(event) => handleWorkEditChange(item.id, 'company', event.target.value)}
                                    />
                                    <input
                                      placeholder="Role"
                                      value={workEditing[item.id].role}
                                      onChange={(event) => handleWorkEditChange(item.id, 'role', event.target.value)}
                                    />
                                    <div className="work-dates">
                                      <input
                                        type="date"
                                        value={workEditing[item.id].start_date}
                                        onChange={(event) => handleWorkEditChange(item.id, 'start_date', event.target.value)}
                                      />
                                      <input
                                        type="date"
                                        value={workEditing[item.id].end_date}
                                        onChange={(event) => handleWorkEditChange(item.id, 'end_date', event.target.value)}
                                      />
                                    </div>
                                    <textarea
                                      rows={2}
                                      placeholder="Description"
                                      value={workEditing[item.id].description}
                                      onChange={(event) => handleWorkEditChange(item.id, 'description', event.target.value)}
                                    />
                                    <div className="inline-actions">
                                      <button type="button" className="secondary" onClick={() => handleSaveWork(item.id)}>
                                        Save
                                      </button>
                                      <button type="button" className="text" onClick={() => handleCancelWorkEdit(item.id)}>
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div className="work-row">
                                      <strong>{item.role}</strong>
                                      <span className="work-meta">{item.company}</span>
                                    </div>
                                    {(item.start_date || item.end_date) && (
                                      <p className="muted">
                                        {[item.start_date, item.end_date].filter(Boolean).join(' → ') || ''}
                                      </p>
                                    )}
                                    {item.description && <p>{item.description}</p>}
                                    <div className="inline-actions">
                                      <button type="button" className="text" onClick={() => handleStartWorkEdit(item)}>
                                        Edit
                                      </button>
                                      <button type="button" className="text danger" onClick={() => handleDeleteWork(item.id)}>
                                        Delete
                                      </button>
                                    </div>
                                  </>
                                )}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="empty">No work entries yet</p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="profile-subsection">
                    <button type="button" className="accordion-toggle" onClick={() => toggleSection(profile.id, 'skills')}>
                      <span>Skills</span>
                      <span>{isSectionExpanded(profile.id, 'skills') ? '−' : '+'}</span>
                    </button>
                    {isSectionExpanded(profile.id, 'skills') && (
                      <div className="accordion-content">
                        <ul className="chips">
                          {(profile.skills ?? []).map((skill) => (
                            <li key={skill.id} className="chip">
                              {skillEditing[skill.id] !== undefined ? (
                                <span className="chip-editor">
                                  <input
                                    value={skillEditing[skill.id]}
                                    onChange={(event) => handleChangeSkillEdit(skill.id, event.target.value)}
                                  />
                                  <button type="button" className="text" onClick={() => handleSaveSkill(skill, profile.id)}>
                                    Save
                                  </button>
                                  <button type="button" className="text" onClick={() => handleCancelSkillEdit(skill.id)}>
                                    Cancel
                                  </button>
                                </span>
                              ) : (
                                <span className="chip-display">
                                  {skill.name}
                                  <button type="button" onClick={() => handleStartSkillEdit(skill)}>✎</button>
                                  <button type="button" onClick={() => handleDeleteSkill(skill.id)}>✕</button>
                                </span>
                              )}
                            </li>
                          ))}
                          {!(profile.skills ?? []).length && <li className="empty">No skills yet</li>}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="profile-subsection">
                    <button type="button" className="accordion-toggle" onClick={() => toggleSection(profile.id, 'projects')}>
                      <span>Projects</span>
                      <span>{isSectionExpanded(profile.id, 'projects') ? '−' : '+'}</span>
                    </button>
                    {isSectionExpanded(profile.id, 'projects') && (
                      <div className="accordion-content">
                        <ul className="project-mini-list">
                          {(profile.projects ?? []).map((project) => (
                            <li key={project.id}>
                              {projectEditing[project.id] ? (
                                <div className="stack-form">
                                  <input
                                    placeholder="Title"
                                    value={projectEditing[project.id].title}
                                    onChange={(event) => handleProjectEditChange(project.id, 'title', event.target.value)}
                                  />
                                  <textarea
                                    rows={2}
                                    placeholder="Description"
                                    value={projectEditing[project.id].description}
                                    onChange={(event) => handleProjectEditChange(project.id, 'description', event.target.value)}
                                  />
                                  <input
                                    placeholder="Link"
                                    value={projectEditing[project.id].links}
                                    onChange={(event) => handleProjectEditChange(project.id, 'links', event.target.value)}
                                  />
                                  <div className="inline-actions">
                                    <button type="button" className="secondary" onClick={() => handleSaveProject(project.id)}>
                                      Save
                                    </button>
                                    <button type="button" className="text" onClick={() => handleCancelProjectEdit(project.id)}>
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="project-line">
                                  <div>
                                    <strong>{project.title}</strong>
                                    <p>{project.description}</p>
                                  </div>
                                  <div className="inline-actions">
                                    {project.links && (
                                      <a href={project.links} target="_blank" rel="noreferrer" className="text link">
                                        View ↗
                                      </a>
                                    )}
                                    <button type="button" className="text" onClick={() => handleStartProjectEdit(project)}>
                                      Edit
                                    </button>
                                    <button type="button" className="text danger" onClick={() => handleDeleteProject(project.id)}>
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              )}
                            </li>
                          ))}
                          {!(profile.projects ?? []).length && <li className="empty">No projects yet</li>}
                        </ul>
                      </div>
                    )}
                  </div>
                </>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="section profile-create">
        <div className="section-headline">
          <h2>Add new profile</h2>
          <p>Create additional profiles with their contact details.</p>
        </div>
        <form className="stack-form" onSubmit={handleCreateProfile}>
          <label>
            Name
            <input
              value={profileForm.name}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={profileForm.email}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, email: event.target.value }))}
              required
            />
          </label>
          <label>
            Education
            <input
              value={profileForm.education}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, education: event.target.value }))}
            />
          </label>
          <label>
            GitHub
            <input
              value={profileForm.github}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, github: event.target.value }))}
            />
          </label>
          <label>
            LinkedIn
            <input
              value={profileForm.linkedin}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, linkedin: event.target.value }))}
            />
          </label>
          <label>
            Portfolio
            <input
              value={profileForm.portfolio}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, portfolio: event.target.value }))}
            />
          </label>
          <button type="submit" className="primary">Create profile</button>
        </form>
      </section>

      <section className="section search-section">
        <div className="section-headline">
          <h2>Search by skill</h2>
          <p>Instantly find projects tagged with specific skills.</p>
        </div>
        <form className="search-form" onSubmit={handleSkillSearch}>
          <input
            placeholder="Try typing python or react"
            value={skillQuery}
            onChange={(event) => setSkillQuery(event.target.value)}
          />
          <button type="submit" className="primary" disabled={!skillQuery.trim()}>
            Search
          </button>
        </form>
        <div className="search-results">
          {skillResults.length > 0 ? (
            <ul>
              {skillResults.map((project) => (
                <li key={project.id}>
                  <strong>{project.title}</strong>
                  <p>{project.description}</p>
                  {project.links && (
                    <a href={project.links} target="_blank" rel="noreferrer">
                      View ↗
                    </a>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty">No skill search results yet.</p>
          )}
        </div>
      </section>

      <section className="section projects-section">
        <div className="section-headline">
          <h2>Projects overview</h2>
          <p>All projects grouped with the profile they belong to.</p>
        </div>
        <div className="projects-grid">
          {flattenedProjects.length ? (
            flattenedProjects.map((project) => (
              <article key={project.id} className="project-card">
                <header>
                  <h3>{project.title}</h3>
                  <span className="badge">{project.profileName}</span>
                </header>
                <p>{project.description}</p>
                {project.links && (
                  <a href={project.links} target="_blank" rel="noreferrer" className="text link">
                    Visit ↗
                  </a>
                )}
              </article>
            ))
          ) : (
            <p className="empty">Create a project to fill this space.</p>
          )}
        </div>
      </section>

      {error && <footer className="error-banner">{error}</footer>}
      {modalState.type && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-panel">
            <header className="modal-header">
              <h3>{modalState.type === 'work' ? 'Add work entry' : modalState.type === 'skill' ? 'Add skill' : 'Add project'}</h3>
              <button type="button" className="text" onClick={closeModal} aria-label="Close">
                ×
              </button>
            </header>
            <div className="modal-body">
              {modalState.type === 'work' && (
                <div className="stack-form">
                  <input
                    placeholder="Company"
                    value={modalState.data?.company ?? ''}
                    onChange={(event) => handleModalChange('company', event.target.value)}
                  />
                  <input
                    placeholder="Role"
                    value={modalState.data?.role ?? ''}
                    onChange={(event) => handleModalChange('role', event.target.value)}
                  />
                  <div className="work-dates">
                    <input
                      type="date"
                      value={modalState.data?.start_date ?? ''}
                      onChange={(event) => handleModalChange('start_date', event.target.value)}
                    />
                    <input
                      type="date"
                      value={modalState.data?.end_date ?? ''}
                      onChange={(event) => handleModalChange('end_date', event.target.value)}
                    />
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Description"
                    value={modalState.data?.description ?? ''}
                    onChange={(event) => handleModalChange('description', event.target.value)}
                  />
                </div>
              )}
              {modalState.type === 'skill' && (
                <div className="stack-form">
                  <input
                    placeholder="Skill name"
                    value={modalState.data?.name ?? ''}
                    onChange={(event) => handleModalChange('name', event.target.value)}
                  />
                </div>
              )}
              {modalState.type === 'project' && (
                <div className="stack-form">
                  <input
                    placeholder="Project title"
                    value={modalState.data?.title ?? ''}
                    onChange={(event) => handleModalChange('title', event.target.value)}
                  />
                  <textarea
                    rows={3}
                    placeholder="Description"
                    value={modalState.data?.description ?? ''}
                    onChange={(event) => handleModalChange('description', event.target.value)}
                  />
                  <input
                    placeholder="Link"
                    value={modalState.data?.links ?? ''}
                    onChange={(event) => handleModalChange('links', event.target.value)}
                  />
                </div>
              )}
            </div>
            <footer className="modal-footer">
              <button type="button" className="text" onClick={closeModal}>
                Cancel
              </button>
              <button type="button" className="primary" onClick={submitModal}>
                Save
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
