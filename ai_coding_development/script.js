function getAllLabels() {
    // query for all html label tags with the class "label"
    const labels = document.querySelectorAll('.label');
    return labels;
}

window.onload = function() {
    const labels = getAllLabels();
};