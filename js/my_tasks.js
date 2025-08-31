import Task from "./modules/task.js";

function updateCounts() {
  document.querySelectorAll(".kanban-column").forEach((col) => {
    const list = col.querySelector(".task-list");
    const countEl = col.querySelector(".count");
    if (list && countEl) {
      countEl.textContent = list.querySelectorAll(".task-card").length;
    }
  });
}

function getBadgeColor(item) {
  let badgeClass = "bg-secondary";
  if (item.priority === "High") badgeClass = "bg-danger";
  else if (item.priority === "Medium") badgeClass = "bg-info";
  else if (item.priority === "Low") badgeClass = "bg-warning";
  return badgeClass;
}

$(async function () {
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  let id = loggedInUser?.id;
  let tasks = await Task.employeeTasks(id);

  $.each(
    tasks.filter((el) => el.status == "Completed"),
    function (index, item) {
      let badgeClass = getBadgeColor(item);
      let card = `<div class="card task-card">
                    <div class="card-body" id="${item.id}">
                        <span class="badge bg-success badge-custom badge-completed ms-1">Completed ✅</span>
                        <span class="badge ${badgeClass} badge-custom">${item.priority}</span>
                        <h6 class="mt-2">${item.title}</h6>
                        <p class="text-muted small mb-2">${item.description}</p>
                    </div>
                </div>`;
      $("#done").append(card);
    }
  );
  $.each(
    tasks.filter((el) => el.status == "In Progress"),
    function (index, item) {
      let badgeClass = getBadgeColor(item);

      let card = `<div class="card task-card">
                    <div class="card-body" id="${item.id}">
                        <span class="badge ${badgeClass} badge-custom">${item.priority}</span>
                        <h6 class="mt-2">${item.title}</h6>
                        <p class="text-muted small mb-2">${item.description}</p>
                    </div>
                </div>`;
      $("#in_progress").append(card);
    }
  );
  $.each(
    tasks.filter((el) => el.status == "To Do"),
    function (index, item) {
      let badgeClass = getBadgeColor(item);

      let card = `<div class="card task-card">
                    <div class="card-body" id="${item.id}">
                        <span class="badge ${badgeClass} badge-custom">${item.priority}</span>
                        <h6 class="mt-2">${item.title}</h6>
                        <p class="text-muted small mb-2">${item.description}</p>
                    </div>
                </div>`;
      $("#to_do").append(card);
    }
  );

  updateCounts();
  
  function updateStatus(id, status) {
    tasks.find((el) => (el.id = id)).status = status;
  }

  $(".task-list")
    .sortable({
      connectWith: ".task-list",
      items: "> .task-card",
      placeholder: "drag-placeholder",
      forcePlaceholderSize: true,
      dropOnEmpty: true,
      tolerance: "pointer",
      helper: "clone",
      appendTo: "body",
      start: function (e, ui) {
        ui.placeholder.height(ui.item.outerHeight());
      },
      over: function () {
        $(this).addClass("is-over");
      },
      out: function () {
        $(this).removeClass("is-over");
      },
      receive: function (e, ui) {
        updateCounts();
        console.log($(this).attr("id"));
        let card = ui.item;
        if ($(this).attr("id") === "done") {
          card
            .find(".card-body")
            .prepend(
              '<span class="badge bg-success badge-custom badge-completed ms-1">Completed ✅</span>'
            );
          updateStatus(card.find(".card-body").attr("id"), "Completed");
          console.log(
            tasks.find((el) => (el.id = card.find(".card-body").attr("id")))
          );
        } else {
          card.find(".badge-completed").remove();
        }

        if ($(this).attr("id") === "in_progress") {
          updateStatus(card.find(".card-body").attr("id"), "In Progress");
          console.log(
            tasks.find((el) => (el.id = card.find(".card-body").attr("id")))
          );
        }

        if ($(this).attr("id") === "to_do") {
          updateStatus(card.find(".card-body").attr("id"), "To Do");
          console.log(
            tasks.find((el) => (el.id = card.find(".card-body").attr("id")))
          );
        }
      },
      update: updateCounts,
    })
    .disableSelection();

  updateCounts();
});
