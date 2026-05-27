(function () {
  'use strict';

  // --- NYC bounding box (rough five-borough envelope) ---
  // Lat: 40.477 (Tottenville) -> 40.917 (Wakefield)
  // Lng: -74.260 (Staten Island west) -> -73.700 (eastern Queens)
  const NYC_BOUNDS = {
    minLat: 40.477,
    maxLat: 40.917,
    minLng: -74.260,
    maxLng: -73.700,
  };

  const gate = document.getElementById('gate');
  const gateTitle = document.getElementById('gate-title');
  const gateSub = document.getElementById('gate-sub');
  const gateSpinner = document.getElementById('gate-spinner');
  const gateRetry = document.getElementById('gate-retry');
  const page = document.getElementById('page');

  function inNYC(lat, lng) {
    return (
      lat >= NYC_BOUNDS.minLat && lat <= NYC_BOUNDS.maxLat &&
      lng >= NYC_BOUNDS.minLng && lng <= NYC_BOUNDS.maxLng
    );
  }

  function showPage() {
    gate.classList.add('hidden');
    page.hidden = false;
    renderSchedule();
    wireShop();
  }

  function showOutsideNYC() {
    gateSpinner.style.display = 'none';
    gateRetry.hidden = true;
    gateTitle.textContent = 'NYC only.';
    gateSub.innerHTML = 'You have to be in <strong>New York City</strong> to buy the special edition NYC Wobbles.';
  }

  function showDenied(msg) {
    gateSpinner.style.display = 'none';
    gateTitle.textContent = 'Location needed.';
    gateSub.textContent = msg || 'We need your location to verify you are inside the five boroughs. Enable location and try again.';
    gateRetry.hidden = false;
  }

  function checkLocation() {
    gateSpinner.style.display = 'block';
    gateRetry.hidden = true;
    gateTitle.textContent = 'Checking your location…';
    gateSub.textContent = 'This drop is for New York City only. Allow location access to continue.';

    if (!('geolocation' in navigator)) {
      showDenied('Your browser does not support geolocation.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      function (pos) {
        const { latitude, longitude } = pos.coords;
        if (inNYC(latitude, longitude)) {
          showPage();
        } else {
          showOutsideNYC();
        }
      },
      function (err) {
        if (err.code === err.PERMISSION_DENIED) {
          showDenied('Location access was blocked. Allow it in your browser to verify NYC.');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          showDenied('Could not determine your location. Try again with a clearer signal.');
        } else if (err.code === err.TIMEOUT) {
          showDenied('Location request timed out. Try again.');
        } else {
          showDenied('Could not verify your location.');
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  }

  gateRetry.addEventListener('click', checkLocation);

  // --- SCHEDULE ---
  function renderSchedule() {
    const list = document.getElementById('schedule-list');
    if (!list || !window.WOBBLES_DATA) return;
    list.innerHTML = window.WOBBLES_DATA.games.map(function (g) {
      return (
        '<div class="game' + (g.ifNeeded ? ' if-needed' : '') + '">' +
          '<div class="game-num">' + g.num + (g.ifNeeded ? ' · IF NECESSARY' : '') + '</div>' +
          '<div class="game-date">' + g.date + '</div>' +
          '<div class="game-day">' + g.day + '</div>' +
          '<div class="game-match">' + g.match + '</div>' +
          '<div class="game-loc">' + g.loc + '</div>' +
          '<div class="game-tip">' + g.tip + '</div>' +
        '</div>'
      );
    }).join('');
  }

  // --- SHOP QTY ---
  function wireShop() {
    const PRICE = 67;
    const qtyVal = document.getElementById('qty-val');
    const sumQty = document.getElementById('sum-qty');
    const sumSub = document.getElementById('sum-sub');
    const sumTotal = document.getElementById('sum-total');
    let qty = 1;

    function render() {
      qtyVal.textContent = qty;
      sumQty.textContent = qty;
      const sub = (PRICE * qty).toFixed(2);
      sumSub.textContent = '$' + sub;
      sumTotal.textContent = '$' + sub + ' USD';
    }

    document.getElementById('qty-minus').addEventListener('click', function () {
      qty = Math.max(1, qty - 1);
      render();
    });
    document.getElementById('qty-plus').addEventListener('click', function () {
      qty = Math.min(10, qty + 1);
      render();
    });
    render();
  }

  // Kick off
  checkLocation();
})();
