export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'alive':
      return 'status-alive';
    case 'powered off':
      return 'status-powered-off';
    case 'not alive':
      return 'status-not-alive';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusDotColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'alive':
      return 'status-dot-alive';
    case 'powered off':
      return 'status-dot-powered-off';
    case 'not alive':
      return 'status-dot-not-alive';
    default:
      return 'bg-gray-500';
  }
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const generateCSVTemplate = () => {
  const headers = [
    'vm_name', 'os_hostname', 'ip_address', 'asset_type_id', 'os_type_id', 'os_version',
    'assigned_user', 'user_password', 'department_id', 'business_purpose', 'server_status_id',
    'me_installed_status', 'tenable_installed_status', 'patching_schedule_id', 'patching_type_id',
    'server_patch_type', 'location_id', 'additional_remarks', 'serial_no', 'idrac_enabled', 'idrac_ip', 'eol_status'
  ];

  const sampleData = [
    ['WEB-01', 'web-01.local', '192.168.1.100', '1', '2', 'Ubuntu 20.04', 'john@company.com', 'pass123', '1', 'Web Server', '1', 'true', 'false', '1', '1', 'Critical', '1', 'Production server', 'SN001', 'false', '', 'InSupport']
  ];

  let csv = headers.join(',') + '\n';
  sampleData.forEach(row => {
    csv += row.join(',') + '\n';
  });

  return csv;
};

export const downloadCSVTemplate = () => {
  const csv = generateCSVTemplate();
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
  element.setAttribute('download', 'asset_import_template.csv');
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};
