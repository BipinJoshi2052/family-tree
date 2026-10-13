"use strict";
/* Thin jQuery-AJAX wrappers over the Laravel JSON endpoints (routes/web.php). Every call returns
   the jqXHR promise; callers use .done()/.fail() or await it. CSRF token is wired in once here so
   nothing else has to think about it. `cache:false` stops the browser from reusing an old GET
   response (e.g. the dashboard's tree list right after signup, before any tree existed) for every
   later fetch of the same URL. */
$.ajaxSetup({ headers: { "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content") }, cache: false });

function apiErr(xhr) {
  return (xhr.responseJSON && (xhr.responseJSON.message || Object.values(xhr.responseJSON.errors || {})[0]?.[0])) || "Something went wrong.";
}

/* The editor's layout engine (gensOf/pass/treeLayout/arrange/...) was built against the old
   JSON-file field names (fid/mid/birthDate/nameNe/...). Rather than touch that already-debugged
   code, API person records are normalized into that same shape right after fetching. */
function normalizePerson(p) {
  return {
    id: p.id, name: p.name, nameNe: p.name_ne, gender: p.gender, birthDate: p.birth_date || "",
    status: p.status, deathDate: p.death_date || "", birthplace: p.birthplace || "",
    phone: p.phone || "", location: p.location || "", residency: p.residency || "local",
    bio: p.bio || "", img: p.img || "", pids: p.pids || [], fid: p.father_id || null, mid: p.mother_id || null,
    updatedAt: p.updated_at ? new Date(p.updated_at).getTime() : 0,
    sortOrder: p.sort_order ?? null,
  };
}

const Api = {
  trees: {
    list: () => $.get("/api/trees"),
    show: (slug) => $.get(`/api/trees/${encodeURIComponent(slug)}`),
    create: (name, defaultLang, person) => $.post("/api/trees", { name, default_lang: defaultLang, person }),
    update: (id, data) => $.ajax({ url: `/api/trees/${id}`, method: "PATCH", data }),
    remove: (id) => $.ajax({ url: `/api/trees/${id}`, method: "DELETE" }),
    import: (file) => {
      const fd = new FormData();
      fd.append("file", file);
      return $.ajax({ url: "/api/trees/import", method: "POST", data: fd, processData: false, contentType: false });
    },
    share: (id) => $.ajax({ url: `/api/trees/${id}/share`, method: "POST" }),
    unshare: (id) => $.ajax({ url: `/api/trees/${id}/share`, method: "DELETE" }),
  },
  shared: {
    data: (token) => $.get(`/api/shared/${encodeURIComponent(token)}`),
  },
  people: {
    list: (treeId) => $.get(`/api/trees/${treeId}/people`).then(rows => rows.map(normalizePerson)),
    add: (treeId, data) => $.post(`/api/trees/${treeId}/people`, data),
    update: (id, data) => $.ajax({ url: `/api/people/${id}`, method: "PATCH", data }),
    remove: (id) => $.ajax({ url: `/api/people/${id}`, method: "DELETE" }),
    branch: (id, name) => $.post(`/api/people/${id}/branch`, { name }),
    uploadPhoto: (id, blob) => {
      const fd = new FormData();
      fd.append("photo", blob, "photo.jpg");
      return $.ajax({ url: `/api/people/${id}/photo`, method: "POST", data: fd, processData: false, contentType: false });
    },
    removePhoto: (id) => $.ajax({ url: `/api/people/${id}/photo`, method: "DELETE" }),
  },
  settings: {
    get: () => $.get("/api/settings"),
    update: (data) => $.ajax({ url: "/api/settings", method: "PATCH", data }),
  },
};
