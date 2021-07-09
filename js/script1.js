$(document).ready(function () {
	sessionStorage.clear()
	google.charts.load("current", {packages:["timeline"]});
	//google.charts.setOnLoadCallback(drawChart);
	const db = firebase.firestore();	
    const employeeRef = db.collection("usuarios").doc("NHqSI7KrBOVWq7DGAAqJIyXZaIM2").collection("datos");
	function nowLine(div){
	var height;
	$('#' + div + ' rect').each(function(index){
		var x = parseFloat($(this).attr('x'));
		var y = parseFloat($(this).attr('y'));
		if(x == 0 && y == 0) {height = parseFloat($(this).attr('height'))}
	})
	var nowWord = $('#' + div + ' :contains("HOY")');
	var DWord = $('#' + div + ' :contains("»")');

	DWord.prev().attr('fill','#ccac00');
	//nowWord.prev().attr('height', height + 'px').attr('fill','#7baaf7');
	}
	
	
	function drawChart(filas) {	
	if (filas.length == 1) {
		return
	}
	var container = document.getElementById('timeline');
	var chart = new google.visualization.Timeline(container);
	var dataTable = new google.visualization.DataTable();
	dataTable.addColumn({ type: 'string', id: 'Room' });
	dataTable.addColumn({ type: 'string', id: 'Name' });
	dataTable.addColumn({ type: 'string', role: 'tooltip' });
	dataTable.addColumn({ type: 'date', id: 'Start' });
	dataTable.addColumn({ type: 'date', id: 'End' });
	dataTable.addRows(filas);
	
	var fecha3 = new Date();
	var fecha4 = new Date();
	fecha3.setDate(fecha3.getDate() - 30);
	fecha4.setDate(fecha4.getDate() + 90);
	var view = new google.visualization.DataView(dataTable);
	view.setRows(dataTable.getFilteredRows([
		{column: 3, minValue: fecha3},
		{column: 4, maxValue: fecha4}
	]));	
	
	
	var options = {
		height: 600,
		timeline: { colorByRowLabel: true, showBarLabels: true,singleColor: '#00796b'},
		alternatingRowStyle: true,
		tooltip: { trigger: 'none'},
		hAxis: {
			format: 'd/M/yy',
			minValue: fecha3,
			maxValue: fecha4,
			
		}
	}
	google.visualization.events.addListener(chart, 'select', function () {
	var selection = chart.getSelection();
	if (selection.length > 0) {
		sessionStorage.setItem('nombre', view.getValue(selection[0].row, 0));
		sessionStorage.setItem('estado', view.getValue(selection[0].row, 1).substring(0, 1));
		sessionStorage.setItem('id', view.getValue(selection[0].row, 2));
		sessionStorage.setItem('fecha_ini', view.getValue(selection[0].row, 3).toISOString().split('T')[0]);
		sessionStorage.setItem('fecha_fin', view.getValue(selection[0].row, 4).toISOString().split('T')[0]);
	}
	});
	chart.draw(view, options);
	nowLine('timeline');
	google.visualization.events.addListener(chart, 'onmouseover', function(obj){
		nowLine('timeline');
		
	})
	google.visualization.events.addListener(chart, 'onmouseout', function(obj){
		nowLine('timeline');
	})
	
	}
	var array2 = []	
	var prueba
	function refrescarDatos(){
	var array1 = []
	var fecha1 = new Date();
	var fecha2 = new Date();
	employeeRef.orderBy("fecha_ini").get().then((querySnapshot) => {
		var fecha_inicio, fecha_fin, fecha_inicio_mostrar, fecha_fin_mostrar
		var today = new Date();
		today.setHours(0,0,0,0);
		array2 = [[ 'Personas','HOY','Now', today, today]]//querySnapshot is "iteratable" itself
		prueba = querySnapshot
		querySnapshot.forEach((userDoc) => {
	
			//userDoc contains all metadata of Firestore object, such as reference and id
			fecha_inicio = userDoc.data().fecha_ini.toDate()
			fecha_fin = userDoc.data().fecha_fin.toDate()
			fecha_inicio_mostrar = fecha_inicio.getDate() + '/'+ (fecha_inicio.getMonth()+1);
			fecha_fin_mostrar = fecha_fin.getDate() + '/'+ (fecha_fin.getMonth()+1);
			var array1 = [userDoc.data().persona,userDoc.data().estado +fecha_inicio_mostrar + '-' + fecha_fin_mostrar, userDoc.id ,fecha_inicio, fecha_fin]
			array2.push(array1)
			//If you want to get doc data
			var userDocData = userDoc.data()
	
		})
	drawChart(array2)
	})
	}
	
	$(document).on('click', '#registros-fecha', function () {	
		$('#fecha-table tbody').html('')
	    //employeeRef.orderBy("fecha_ini").get().then(function (documentSnapshots) {
			prueba.docs.forEach(doc => {
				renderFecha(doc);
			});
		//});
        $('#tableFechaModal').modal('show');		
    });		
	
	
	
	function renderFecha(document) {
		
        let item = `<tr data-id="${document.id}">
        <td>${document.data().persona}</td>
        <td>${document.data().fecha_ini.toDate().toLocaleDateString().split('T')[0]}</td>
        <td>${document.data().fecha_fin.toDate().toLocaleDateString().split('T')[0]}</td>
		<td>${(document.data().fecha_fin - document.data().fecha_ini)/86400}</td>
		</tr>`;
        $('#fecha-table').append(item);
    }
	
	refrescarDatos();	
	
    $(document).on('click', '#add-fecha', function () {	
        $('#addFechaModal').modal('show');		
    });		
    $("#add-fecha-form").submit(function (event) {
        event.preventDefault();
		var diff = new Date($('#fecha-fecha-fin').val()) - new Date($('#fecha-fecha-inicio').val());
		var fecha1 = new Date($('#fecha-fecha-fin').val());
		var fecha2 = new Date($('#fecha-fecha-inicio').val());
		if (diff <= 0 ) {
				swal({
                type: 'error',
                title: 'Error',
                text: "La fecha fin debe ser mayor a la fecha de inicio",
		})
		}else{				
        employeeRef.add({
                fecha_ini: new Date($('#fecha-fecha-inicio').val() + ' 00:00:00') ,
                fecha_fin: new Date($('#fecha-fecha-fin').val()+ ' 00:00:00') ,
                persona: $('#fecha-persona').val(),
				estado: $('#fecha-estado').val()
				
            }).then(function () {
                console.log("Document successfully written!");
                $("#addFechaModal").modal('hide');
				refrescarDatos();
            })
            .catch(function (error) {
                console.error("Error writing document: ", error);
            });
		}	
    });
	
    // DELETE FECHA
    $(document).on('click', '#delete-fecha', function () {
		let id = sessionStorage.getItem('id');
	if (sessionStorage.length == 0 || id == 'Now') {
		swal({
                type: 'error',
                title: 'Error',
                text: "Debe seleccionar un registro a eliminar",
		})
	}else{		
        $('#deleteFechaModal').modal('show');
		
	}	
    });	
	

    $("#delete-fecha-form").submit(function (event) {
        event.preventDefault();
        let id = sessionStorage.getItem('id');
        if (id != undefined || id == 'Now') {
            employeeRef.doc(id).delete()
                .then(function () {
                    console.log("Document successfully delete!");
                    $("#deleteFechaModal").modal('hide');
					refrescarDatos();
                })
                .catch(function (error) {
                    console.error("Error deleting document: ", error);
                });
        } else {

        }
    });

    // UPDATE FECHA
    $(document).on('click', '#editor-fecha', function () {
		let id = sessionStorage.getItem('id');
	var diff = new Date($('#edit-fecha-form #fecha-fecha-fin-ed').val()) - new Date($('#edit-fecha-form #fecha-fecha-inicio-ed').val());	
	if (sessionStorage.length == 0 || id == 'Now') {
		swal({
                type: 'error',
                title: 'Error',
                text: "Debe seleccionar un registro a editar",
		})
		} else if (diff <= 0 ) {
				swal({
                type: 'error',
                title: 'Error',
                text: "La fecha fin debe ser mayor a la fecha de inicio",
		})				
		}else{			
        let id = sessionStorage.getItem('id');
        $('#edit-fecha-form').attr('edit-id', id);
        $('#edit-fecha-form #fecha-fecha-inicio-ed').val(sessionStorage.getItem('fecha_ini'));
        $('#edit-fecha-form #fecha-fecha-fin-ed').val(sessionStorage.getItem('fecha_fin'));
        $('#edit-fecha-form #fecha-persona-ed').val(sessionStorage.getItem('nombre'));
		$('#edit-fecha-form #fecha-estado-ed').val(sessionStorage.getItem('estado'));
        $('#editFechaModal').modal('show');
		
	}	
    });
	

    $("#edit-fecha-form").submit(function (event) {
        event.preventDefault();
		var diff = new Date($('#edit-fecha-form #fecha-fecha-fin-ed').val()) - new Date($('#edit-fecha-form #fecha-fecha-inicio-ed').val());
		if (diff <= 0) {
				swal({
                type: 'error',
                title: 'Error',
                text: "La fecha fin debe ser mayor a la fecha de inicio",
		})	
		}else{	
        let id = sessionStorage.getItem('id');
        employeeRef.doc(id).update({
            fecha_ini: new Date($('#edit-fecha-form #fecha-fecha-inicio-ed').val() + ' 00:00:00'), 
            fecha_fin: new Date($('#edit-fecha-form #fecha-fecha-fin-ed').val() + ' 00:00:00'), 
            persona: $('#edit-fecha-form  #fecha-persona-ed').val(),
			estado: $('#edit-fecha-form  #fecha-estado-ed').val()
			}).then(function () {
				console.log("Document successfully updated!");
				refrescarDatos();
				$('#editFechaModal').modal('hide');
            })

			
		}
	});
	

    $("#addFechaModal").on('hidden.bs.modal', function () {
        $('#add-fecha-form .form-control').val('');
    });

    $("#editFechaModal").on('hidden.bs.modal', function () {
        $('#edit-fecha-form .form-control').val('');
    });
	
	$(window).resize(function(){
		drawChart(array2);
	});
});	
// CENTER MODAL
(function ($) {
    "use strict";

    function centerModal() {
        $(this).css('display', 'block');
        var $dialog = $(this).find(".modal-dialog"),
            offset = ($(window).height() - $dialog.height()) / 2,
            bottomMargin = parseInt($dialog.css('marginBottom'), 10);

        // Make sure you don't hide the top part of the modal w/ a negative margin if it's longer than the screen height, and keep the margin equal to the bottom margin of the modal
        if (offset < bottomMargin) offset = bottomMargin;
        $dialog.css("margin-top", offset);
    }

    $(document).on('show.bs.modal', '.modal', centerModal);
    $(window).on("resize", function () {
        $('.modal:visible').each(centerModal);
    });
}(jQuery));

